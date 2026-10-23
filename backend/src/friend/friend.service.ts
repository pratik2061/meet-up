import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friendship, FriendshipStatus } from 'src/schemas/friendship.schema';
import { User } from 'src/schemas/user.schema';
import { RecentLogService } from 'src/recent-log/recent-log.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { WebrtcGateway } from 'src/webrtc/webrtc.gateway';

@Injectable()
export class FriendService {
  constructor(
    @InjectModel('Friendship')
    private readonly friendshipModel: Model<Friendship>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
    private readonly recentLogService: RecentLogService,
    private readonly webrtcGateway: WebrtcGateway,
  ) { }
  async getFriends(userId: string) {
    try {
      const userObjectId = new Types.ObjectId(userId); 

      const friendships = await this.friendshipModel
        .find({
          status: FriendshipStatus.ACCEPTED,
          $or: [{ requester: userObjectId }, { recipient: userObjectId }],
        })
        .populate('requester', '_id fullName email avatarUrl phoneNumber createdAt')
        .populate('recipient', '_id fullName email avatarUrl phoneNumber createdAt')
        .sort({ updatedAt: -1 })
        .exec();

      const friends = friendships.map((f) => {
        const requester = f.requester as any;
        const recipient = f.recipient as any;
        const isRequester = requester._id.toString() === userId;
        const friendUser = isRequester ? recipient : requester;

        return {
          friendshipId: f._id,
          friend: friendUser,
          friendsSince: f.updatedAt || f.createdAt,
        };
      });

      return {
        status: true,
        message: 'Friends fetched successfully',
        data: friends,
        total: friends.length,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch friends');
    }
  }

  async getRequests(userId: string) {
    try {
      const userObjectId = new Types.ObjectId(userId);

      const [incoming, outgoing] = await Promise.all([
        this.friendshipModel
          .find({
            recipient: userObjectId,
            status: FriendshipStatus.PENDING,
          })
          .populate('requester', '_id fullName email avatarUrl phoneNumber createdAt')
          .sort({ createdAt: -1 })
          .exec(),

        this.friendshipModel
          .find({
            requester: userObjectId,
            status: FriendshipStatus.PENDING,
          })
          .populate('recipient', '_id fullName email avatarUrl phoneNumber createdAt')
          .sort({ createdAt: -1 })
          .exec(),
      ]);

      return {
        status: true,
        message: 'Friend requests fetched successfully',
        data: {
          incoming,
          outgoing,
          incomingCount: incoming.length,
          outgoingCount: outgoing.length,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch friend requests');
    }
  }

  async sendFriendRequest(userId: string, dto: CreateFriendRequestDto) {
    try {
      if (!dto.email && !dto.recipientId) {
        throw new BadRequestException('Recipient email or user ID must be provided');
      }

      let recipientUser: User | null = null;
      if (dto.recipientId) {
        recipientUser = await this.userModel.findById(dto.recipientId).exec();
      } else if (dto.email) {
        recipientUser = await this.userModel
          .findOne({ email: dto.email.trim().toLowerCase() })
          .exec();
      }

      if (!recipientUser) {
        throw new NotFoundException('User not found with the provided details');
      }

      const recipientId = recipientUser._id.toString();
      if (recipientId === userId) {
        throw new BadRequestException('You cannot send a friend request to yourself');
      }

      const userObjectId = new Types.ObjectId(userId);
      const recipientObjectId = new Types.ObjectId(recipientId);

      // Check existing friendship in either direction
      const existing = await this.friendshipModel.findOne({
        $or: [
          { requester: userObjectId, recipient: recipientObjectId },
          { requester: recipientObjectId, recipient: userObjectId },
        ],
      });

      if (existing) {
        if (existing.status === FriendshipStatus.ACCEPTED) {
          throw new BadRequestException('You are already friends with this user');
        }

        if (existing.status === FriendshipStatus.PENDING) {
          if (existing.requester.toString() === userId) {
            throw new BadRequestException('Friend request is already pending');
          } else {
            // Recipient already requested this user: auto-accept it!
            existing.status = FriendshipStatus.ACCEPTED;
            await existing.save();

            const currentUser = await this.userModel.findById(userId).select('fullName email avatarUrl');

            await this.recentLogService.createLog(
              userId,
              'Accepted Friend Request',
              `Became friends with ${recipientUser.fullName} (${recipientUser.email})`,
            );

            // Notify both users in real-time
            this.webrtcGateway.sendToUser(recipientId, 'friend:request_accepted', {
              friend: {
                _id: userId,
                fullName: currentUser?.fullName,
                email: currentUser?.email,
                avatarUrl: currentUser?.avatarUrl,
              },
            });

            return {
              status: true,
              message: `You and ${recipientUser.fullName} are now friends!`,
              data: existing,
            };
          }
        }

        // If rejected, allow re-requesting
        existing.requester = userObjectId;
        existing.recipient = recipientObjectId;
        existing.status = FriendshipStatus.PENDING;
        await existing.save();

        const currentUser = await this.userModel.findById(userId).select('fullName email avatarUrl');

        await this.recentLogService.createLog(
          userId,
          'Sent Friend Request',
          `Sent friend request to ${recipientUser.fullName} (${recipientUser.email})`,
        );

        // Notify recipient in real-time
        this.webrtcGateway.sendToUser(recipientId, 'friend:request_received', {
          requestId: existing._id.toString(),
          requester: {
            _id: userId,
            fullName: currentUser?.fullName,
            email: currentUser?.email,
            avatarUrl: currentUser?.avatarUrl,
          },
          createdAt: existing.updatedAt,
        });

        return {
          status: true,
          message: `Friend request sent to ${recipientUser.fullName}`,
          data: existing,
        };
      }

      // Create new friendship request
      const newFriendship = await this.friendshipModel.create({
        requester: userObjectId,
        recipient: recipientObjectId,
        status: FriendshipStatus.PENDING,
      });

      const currentUser = await this.userModel.findById(userId).select('fullName email avatarUrl');

      await this.recentLogService.createLog(
        userId,
        'Sent Friend Request',
        `Sent friend request to ${recipientUser.fullName} (${recipientUser.email})`,
      );

      // Notify recipient in real-time
      this.webrtcGateway.sendToUser(recipientId, 'friend:request_received', {
        requestId: newFriendship._id.toString(),
        requester: {
          _id: userId,
          fullName: currentUser?.fullName,
          email: currentUser?.email,
          avatarUrl: currentUser?.avatarUrl,
        },
        createdAt: newFriendship.createdAt,
      });

      return {
        status: true,
        message: `Friend request sent to ${recipientUser.fullName}`,
        data: newFriendship,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Error in sendFriendRequest:', error);
      throw new InternalServerErrorException('Failed to send friend request');
    }
  }

  async respondToRequest(
    userId: string,
    requestId: string,
    dto: RespondFriendRequestDto,
  ) {
    try {
      const friendship = await this.friendshipModel
        .findById(requestId)
        .populate('requester', '_id fullName email')
        .populate('recipient', '_id fullName email')
        .exec();

      if (!friendship) {
        throw new NotFoundException('Friend request not found');
      }

      const recipientId = (friendship.recipient as any)._id
        ? (friendship.recipient as any)._id.toString()
        : friendship.recipient.toString();

      if (recipientId !== userId) {
        throw new ForbiddenException('You can only respond to requests sent to you');
      }

      friendship.status = dto.status;
      await friendship.save();

      const requesterName = (friendship.requester as any)?.fullName || 'user';
      const requesterId = (friendship.requester as any)._id
        ? (friendship.requester as any)._id.toString()
        : friendship.requester.toString();

      const currentUser = await this.userModel.findById(userId).select('fullName email avatarUrl');

      if (dto.status === FriendshipStatus.ACCEPTED) {
        await this.recentLogService.createLog(
          userId,
          'Accepted Friend Request',
          `Accepted friend request from ${requesterName}`,
        );

        // Notify requester in real-time
        this.webrtcGateway.sendToUser(requesterId, 'friend:request_accepted', {
          friend: {
            _id: userId,
            fullName: currentUser?.fullName,
            email: currentUser?.email,
            avatarUrl: currentUser?.avatarUrl,
          },
        });
      } else {
        await this.recentLogService.createLog(
          userId,
          'Declined Friend Request',
          `Declined friend request from ${requesterName}`,
        );

        // Notify requester in real-time
        this.webrtcGateway.sendToUser(requesterId, 'friend:request_declined', {
          requestId: friendship._id.toString(),
        });
      }

      return {
        status: true,
        message:
          dto.status === FriendshipStatus.ACCEPTED
            ? `Accepted friend request from ${requesterName}`
            : `Declined friend request`,
        data: friendship,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error in respondToRequest:', error);
      throw new InternalServerErrorException('Failed to respond to friend request');
    }
  }


  async removeFriend(userId: string, targetId: string) {
    try {
      const userObjectId = new Types.ObjectId(userId);
      let targetObjectId: Types.ObjectId;
      try {
        targetObjectId = new Types.ObjectId(targetId);
      } catch {
        throw new BadRequestException('Invalid target ID format');
      }

      // Find by friendshipId or by friend's userId
      const friendship = await this.friendshipModel
        .findOne({
          $or: [
            { _id: targetObjectId, $or: [{ requester: userObjectId }, { recipient: userObjectId }] },
            { requester: userObjectId, recipient: targetObjectId },
            { requester: targetObjectId, recipient: userObjectId },
          ],
        })
        .populate('requester', '_id fullName email')
        .populate('recipient', '_id fullName email')
        .exec();

      if (!friendship) {
        throw new NotFoundException('Friendship not found');
      }

      await this.friendshipModel.findByIdAndDelete(friendship._id).exec();

      const requester = friendship.requester as any;
      const recipient = friendship.recipient as any;
      const isRequester = requester._id.toString() === userId;
      const otherUser = isRequester ? recipient : requester;
      const otherName = otherUser?.fullName || 'user';
      const otherUserId = otherUser?._id?.toString();

      await this.recentLogService.createLog(
        userId,
        'Removed Friend',
        `Removed connection with ${otherName}`,
      );

      // Notify other user in real-time
      if (otherUserId) {
        this.webrtcGateway.sendToUser(otherUserId, 'friend:removed', {
          friendshipId: friendship._id.toString(),
          userId,
        });
      }

      return {
        status: true,
        message: `Removed ${otherName} from friends`,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error in removeFriend:', error);
      throw new InternalServerErrorException('Failed to remove friend');
    }
  }

  async searchUsers(userId: string, query: SearchUsersQueryDto) {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const limit = Math.max(1, Math.min(50, Number(query.limit) || 20));

      const filter: Record<string, any> = { _id: { $ne: userObjectId } };

      if (query.q && query.q.trim()) {
        const escaped = query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escaped, 'i');
        filter.$or = [
          { fullName: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ];
      }

      const users = await this.userModel
        .find(filter)
        .select('_id fullName email avatarUrl phoneNumber createdAt')
        .limit(limit)
        .lean()
        .exec();

      // Retrieve friendships involving current user to annotate results
      const userFriendships = await this.friendshipModel
        .find({
          $or: [{ requester: userObjectId }, { recipient: userObjectId }],
        })
        .exec();

      const annotatedUsers = users.map((u) => {
        const match = userFriendships.find((f) => {
          const reqId = f.requester.toString();
          const recId = f.recipient.toString();
          const uId = u._id.toString();
          return reqId === uId || recId === uId;
        });

        let relationship: 'NONE' | 'FRIENDS' | 'PENDING_OUTGOING' | 'PENDING_INCOMING' =
          'NONE';
        let friendshipId: string | undefined = undefined;

        if (match) {
          friendshipId = match._id.toString();
          if (match.status === FriendshipStatus.ACCEPTED) {
            relationship = 'FRIENDS';
          } else if (match.status === FriendshipStatus.PENDING) {
            if (match.requester.toString() === userId) {
              relationship = 'PENDING_OUTGOING';
            } else {
              relationship = 'PENDING_INCOMING';
            }
          }
        }

        return {
          ...u,
          relationship,
          friendshipId,
        };
      });

      return {
        status: true,
        message: 'Users fetched successfully',
        data: annotatedUsers,
      };
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw new InternalServerErrorException('Failed to search users');
    }
  }
}
