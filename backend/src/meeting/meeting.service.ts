import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meeting } from 'src/schemas/meeting.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel('Meeting') private readonly MeetingModel: Model<Meeting>,
    @InjectModel('User') private readonly UserModel: Model<User>,
  ) {}
  async createMeeting(createMeetingDto: CreateMeetingDto, userId: string) {
    const meeting = await this.MeetingModel.create({
      host: userId,
      ...createMeetingDto,
    });
    if (!meeting) {
      throw new BadRequestException('Failed to create meeting');
    }
    return {
      message: ' Meeting created successfully',
      meetingData: meeting,
    };
  }
}
