import { Injectable } from '@nestjs/common';
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
}
