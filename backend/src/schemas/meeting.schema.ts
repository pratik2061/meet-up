import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { User } from './user.schema';
import mongoose, { Document, Types } from 'mongoose';

export function generateRoomCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const getSegment = (length: number) => {
    const bytes = randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  };
  return `${getSegment(4)}-${getSegment(4)}`;
}

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
    default: () => generateRoomCode(),
  })
  roomId!: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  host!: User | Types.ObjectId | string;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ])
  participants!: (User | Types.ObjectId | string)[];

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
    default: null,
  })
  scheduledAt!: Date;

  @Prop({
    type: Date,
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
MeetingSchema.index({ host: 1, scheduledAt: 1, createdAt: -1 });
MeetingSchema.index({ participants: 1, scheduledAt: 1, createdAt: -1 });
MeetingSchema.index({ meetingStatus: 1 });
