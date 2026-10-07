import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingStatus } from 'src/schemas/meeting.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel('Meeting') private readonly MeetingModel: Model<Meeting>,
    @InjectModel('User') private readonly UserModel: Model<User>,
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
      const isHost =
        findMeeting.host instanceof Types.ObjectId &&
        findMeeting.host.equals(userId);
      if (!isHost) {
        throw new ForbiddenException('Only the host can end the meeting');
      }
      const endedAt = new Date();

      const calculteMeetingDuration = findMeeting.startedAt
        ? endedAt.getTime() - findMeeting.startedAt.getTime()
        : 0;

      findMeeting.endedAt = endedAt;
      findMeeting.meetingDuration = String(calculteMeetingDuration);
      findMeeting.meetingStatus = MeetingStatus.COMPLETED;
      await findMeeting.save();
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
}
