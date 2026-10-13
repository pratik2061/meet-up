import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingQueryDto } from './dto/meeting-query.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingStatus } from 'src/schemas/meeting.schema';
import { User } from 'src/schemas/user.schema';
import { RecentLogService } from 'src/recent-log/recent-log.service';

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel('Meeting') private readonly MeetingModel: Model<Meeting>,
    @InjectModel('User') private readonly UserModel: Model<User>,
    private readonly recentLogService: RecentLogService,
  ) { }
  async createMeeting(createMeetingDto: CreateMeetingDto, userId: string) {
    try {
      const checkUser = await this.UserModel.findById(userId);
      if (!checkUser) {
        throw new NotFoundException('User not found');
      }
      const meeting = await this.MeetingModel.create({
        host: userId,
        ...createMeetingDto,
      });
      if (!meeting) {
        throw new BadRequestException('Failed to create meeting');
      }
      
      await this.recentLogService.createLog(
        userId,
        'Created Meeting',
        `Created a new meeting with room ID: ${meeting.roomId}`
      );

      return {
        message: 'Meeting created successfully',
        meetingData: meeting,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the meeting',
      );
    }
  }

  async getMeeting(roomId: string) {
    try {
      if (!roomId) {
        throw new BadRequestException('Room ID is required');
      }
      const meeting = await this.MeetingModel.findOne({
        roomId,
      }).populate('host');
      if (!meeting) {
        throw new NotFoundException('Meeting not found');
      }
      return {
        message: 'Meeting fetched successfully',
        status: true,
        meetingData: meeting,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching the meeting data',
      );
    }
  }

  async validateJoinMeeting(roomId: string, userId: string) {
    try {
      if (!roomId || !userId) {
        throw new BadRequestException('Room ID and User ID are required');
      }
      const findUser = await this.UserModel.findById(userId);

      if (!findUser) {
        throw new NotFoundException('User not found');
      }
      const findMeeting = await this.MeetingModel.findOne({
        roomId,
      });
      if (!findMeeting) {
        throw new NotFoundException('Meeting not found');
      }
      if (findMeeting.meetingStatus === MeetingStatus.CANCELLED) {
        throw new ForbiddenException('Meeting has been cancelled');
      }
      if (findMeeting.meetingStatus === MeetingStatus.COMPLETED) {
        throw new ForbiddenException('This meeting has already ended');
      }
      return {
        isValid: true,
        meetingDetails: findMeeting,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while validating the join meeting request',
      );
    }
  }

  async endMeeting(roomId: string, userId: string) {
    try {
      if (!roomId || !userId) {
        throw new BadRequestException('Room ID and User ID are required');
      }
      const findMeeting = await this.MeetingModel.findOne({
        roomId,
      });
      if (!findMeeting) {
        throw new NotFoundException('Meeting not found');
      }
      const hostId =
        typeof findMeeting.host === 'object' &&
        findMeeting.host !== null &&
        '_id' in (findMeeting.host as any)
          ? (findMeeting.host as any)._id.toString()
          : (findMeeting.host as any).toString();
      const isHost = hostId === userId.toString();
      if (!isHost) {
        throw new ForbiddenException('Only the host can end the meeting');
      }
      if (findMeeting.meetingStatus === MeetingStatus.COMPLETED) {
        return {
          message: 'Meeting already ended',
          meetingData: findMeeting,
        };
      }
      const endedAt = new Date();

      const calculteMeetingDuration = findMeeting.startedAt
        ? endedAt.getTime() - findMeeting.startedAt.getTime()
        : (findMeeting as any).createdAt
          ? endedAt.getTime() - new Date((findMeeting as any).createdAt).getTime()
          : 0;

      findMeeting.endedAt = endedAt;
      findMeeting.meetingDuration = String(calculteMeetingDuration);
      findMeeting.meetingStatus = MeetingStatus.COMPLETED;
      await findMeeting.save();

      await this.recentLogService.createLog(
        userId,
        'Ended Meeting',
        `Ended the meeting with room ID: ${findMeeting.roomId}`
      );

      return {
        message: 'Meeting ended successfully',
        meetingData: findMeeting,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while ending the meeting',
      );
    }
  }

  async cancelMeeting(roomId: string, userId: string) {
    try {
      if (!roomId || !userId) {
        throw new BadRequestException('Room ID and User ID are required');
      }
      const findMeeting = await this.MeetingModel.findOne({
        roomId,
      });
      if (!findMeeting) {
        throw new NotFoundException('Meeting not found');
      }
      const hostId =
        typeof findMeeting.host === 'object' &&
        findMeeting.host !== null &&
        '_id' in (findMeeting.host as any)
          ? (findMeeting.host as any)._id.toString()
          : (findMeeting.host as any).toString();
      const isHost = hostId === userId.toString();
      if (!isHost) {
        throw new ForbiddenException('Only the host can cancel the meeting');
      }
      if (findMeeting.meetingStatus === MeetingStatus.CANCELLED) {
        return {
          message: 'Meeting already cancelled',
          meetingData: findMeeting,
        };
      }
      if (findMeeting.meetingStatus === MeetingStatus.COMPLETED) {
        throw new BadRequestException('Cannot cancel a completed meeting');
      }

      findMeeting.meetingStatus = MeetingStatus.CANCELLED;
      await findMeeting.save();

      await this.recentLogService.createLog(
        userId,
        'Cancelled Meeting',
        `Cancelled the meeting with room ID: ${findMeeting.roomId}`,
      );

      return {
        message: 'Meeting cancelled successfully',
        meetingData: findMeeting,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while cancelling the meeting',
      );
    }
  }

  async updateMeeting(
    roomId: string,
    userId: string,
    updateMeetingDto: UpdateMeetingDto,
  ) {
    try {
      if (!roomId || !userId) {
        throw new BadRequestException('Room ID and User ID are required');
      }
      const findMeeting = await this.MeetingModel.findOne({
        roomId,
      });
      if (!findMeeting) {
        throw new NotFoundException('Meeting not found');
      }
      const hostId =
        typeof findMeeting.host === 'object' &&
        findMeeting.host !== null &&
        '_id' in (findMeeting.host as any)
          ? (findMeeting.host as any)._id.toString()
          : (findMeeting.host as any).toString();
      const isHost = hostId === userId.toString();
      if (!isHost) {
        throw new ForbiddenException('Only the host can update the meeting');
      }

      if (updateMeetingDto.meetingStatus === MeetingStatus.CANCELLED) {
        if (findMeeting.meetingStatus === MeetingStatus.COMPLETED) {
          throw new BadRequestException('Cannot cancel a completed meeting');
        }
        if (findMeeting.meetingStatus !== MeetingStatus.CANCELLED) {
          await this.recentLogService.createLog(
            userId,
            'Cancelled Meeting',
            `Cancelled the meeting with room ID: ${findMeeting.roomId}`,
          );
        }
      }

      if (updateMeetingDto.meetingStatus === MeetingStatus.COMPLETED) {
        if (findMeeting.meetingStatus !== MeetingStatus.COMPLETED) {
          const endedAt = new Date();
          const calculateMeetingDuration = findMeeting.startedAt
            ? endedAt.getTime() - findMeeting.startedAt.getTime()
            : (findMeeting as any).createdAt
              ? endedAt.getTime() - new Date((findMeeting as any).createdAt).getTime()
              : 0;
          findMeeting.endedAt = endedAt;
          findMeeting.meetingDuration = String(calculateMeetingDuration);
          await this.recentLogService.createLog(
            userId,
            'Ended Meeting',
            `Ended the meeting with room ID: ${findMeeting.roomId}`,
          );
        }
      }

      if (updateMeetingDto.meetingType) {
        findMeeting.meetingType = updateMeetingDto.meetingType;
      }
      if (updateMeetingDto.scheduledAt !== undefined) {
        findMeeting.scheduledAt = updateMeetingDto.scheduledAt;
      }
      if (updateMeetingDto.meetingStatus) {
        findMeeting.meetingStatus = updateMeetingDto.meetingStatus;
      }

      await findMeeting.save();

      return {
        message: 'Meeting updated successfully',
        meetingData: findMeeting,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the meeting',
      );
    }
  }

  async ValidateJoinMeeting(roomId: string, userId: string) {
    try {
      if (!roomId || !userId) {
        throw new BadRequestException('Room ID and User ID are required');
      }
      const findUser = await this.UserModel.findById(userId);

      if (!findUser) {
        throw new NotFoundException('User not found');
      }
      const findMeeting = await this.MeetingModel.findOne({
        roomId,
      });
      if (!findMeeting) {
        throw new NotFoundException('Meeting not found');
      }
      if (findMeeting.meetingStatus === MeetingStatus.CANCELLED) {
        throw new ForbiddenException('Meeting has been cancelled');
      }
      if (findMeeting.meetingStatus === MeetingStatus.COMPLETED) {
        throw new ForbiddenException('This meeting has already ended');
      }
      return {
        isValid: true,
        meetingDetails: findMeeting,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while validating the join meeting request',
      );
    }
  }

  async markUserJoined(roomId: string, userId: string) {
    try {
      if (!roomId || !userId) {
        throw new BadRequestException('Room ID and User ID are required');
      }
      const findMeeting = await this.MeetingModel.findOne({
        roomId,
      });
      if (!findMeeting) {
        throw new NotFoundException('Meeting not found');
      }
      await this.MeetingModel.updateOne(
        {
          roomId,
        },
        {
          $addToSet: {
            participants: userId,
          },
          $set: {
            meetingStatus: MeetingStatus.ONGOING,
          },
        },
      );
      if (!findMeeting.startedAt) {
        findMeeting.startedAt = new Date();
        findMeeting.meetingStatus = MeetingStatus.ONGOING;
        await findMeeting.save();
      }

      await this.recentLogService.createLog(
        userId,
        'Joined Meeting',
        `Joined the meeting with room ID: ${findMeeting.roomId}`
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while checking if the user has joined the meeting',
      );
    }
  }

  async getAllMeetings(userId: string, query?: MeetingQueryDto) {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      const findUser = await this.UserModel.findById(userId);

      if (!findUser) {
        throw new NotFoundException('User not found');
      }

      const page = Math.max(1, Number(query?.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(query?.limit) || 10));
      const skip = (page - 1) * limit;

      const userObjectId = Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : userId;

      // Base condition: User must be either the host or a participant
      const userAccessFilter = {
        $or: [{ host: userObjectId }, { participants: userObjectId }],
      };

      const andConditions: any[] = [userAccessFilter];

      // Status filter
      if (
        query?.status &&
        query.status.trim() &&
        query.status.trim().toLowerCase() !== 'all'
      ) {
        andConditions.push({
          meetingStatus: query.status.trim().toLowerCase(),
        });
      }

      // Type filter
      if (query?.type && query.type.trim()) {
        andConditions.push({ meetingType: query.type.trim() });
      }

      // Search filter across roomId, meetingType, host fullName and email
      if (query?.search && query.search.trim()) {
        const escaped = query.search
          .trim()
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escaped, 'i');

        // Look for users matching full name or email to also match meetings hosted by them
        const matchingUsers = await this.UserModel.find({
          $or: [
            { fullName: { $regex: searchRegex } },
            { email: { $regex: searchRegex } },
          ],
        }).select('_id');
        const matchingUserIds = matchingUsers.map((u) => u._id);

        const searchOr: any[] = [
          { roomId: { $regex: searchRegex } },
          { meetingType: { $regex: searchRegex } },
        ];

        if (matchingUserIds.length > 0) {
          searchOr.push({ host: { $in: matchingUserIds } });
        }

        andConditions.push({ $or: searchOr });
      }

      // Date range filter
      if (query?.startDate || query?.endDate) {
        const dateFilter: Record<string, any> = {};
        if (query.startDate) {
          const s = new Date(query.startDate);
          if (!isNaN(s.getTime())) dateFilter.$gte = s;
        }
        if (query.endDate) {
          const e = new Date(query.endDate);
          if (!isNaN(e.getTime())) {
            if (query.endDate.length === 10) e.setHours(23, 59, 59, 999);
            dateFilter.$lte = e;
          }
        }
        if (Object.keys(dateFilter).length > 0) {
          andConditions.push({ createdAt: dateFilter });
        }
      }

      const finalFilter =
        andConditions.length === 1
          ? userAccessFilter
          : { $and: andConditions };

      // Sorting
      let sortCriteria: any = { scheduledAt: 1, createdAt: -1 };
      if (query?.sortBy) {
        const order = query?.sortOrder === 'asc' ? 1 : -1;
        sortCriteria = { [query.sortBy]: order };
      }

      const [meetings, total, statusCountsRaw] = await Promise.all([
        this.MeetingModel.find(finalFilter)
          .populate('host', 'fullName email')
          .populate('participants', 'fullName email')
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.MeetingModel.countDocuments(finalFilter).exec(),
        this.MeetingModel.aggregate([
          { $match: userAccessFilter },
          { $group: { _id: '$meetingStatus', count: { $sum: 1 } } },
        ]),
      ]);

      const counts: Record<string, number> = {
        all: 0,
        ongoing: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
      };

      let allCount = 0;
      statusCountsRaw.forEach((item: { _id: string; count: number }) => {
        if (item._id && typeof item._id === 'string') {
          const key = item._id.toLowerCase();
          counts[key] = item.count;
          allCount += item.count;
        }
      });
      counts.all = allCount;

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        message: 'Meetings fetched successfully',
        status: true,
        meetingsData: meetings,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        counts,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Error fetching meetings:', error);
      throw new InternalServerErrorException(
        'An error occurred while fetching meetings',
      );
    }
  }
}
