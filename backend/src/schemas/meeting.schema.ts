import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { User } from './user.schema';
import mongoose from 'mongoose';

export enum MeetingType {
  CASUALMEETING = 'casualMeeting',
  FORMALMEETING = 'formalMeeting',
  STUDYMEETING = 'studyMeeting',
  OTHERMEETING = 'otherMeeting',
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({
  timestamps: true,
})
export class Meeting extends Document {
  @Prop({
    type: String,
    required: true,
    unique: true,
    default: () => randomUUID(),
  })
  roomId!: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  host!: User;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ])
  participants!: User[];

  @Prop({
    type: String,
    enum: MeetingType,
    default: MeetingType.CASUALMEETING,
  })
  meetingType!: MeetingType;

  @Prop({
    type: String,
    enum: MeetingStatus,
    default: MeetingStatus.SCHEDULED,
  })
  meetingStatus!: MeetingStatus;

  @Prop({
    type: Date,
    default: Date.now(),
  })
  startedAt!: Date;

  @Prop({
    type: Date,
  })
  endedAt!: Date;

  @Prop({
    type: String,
  })
  meetingDuration!: string;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
