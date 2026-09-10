import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { MeetingStatus, MeetingType } from 'src/schemas/meeting.schema';

export class CreateMeetingDto {
  @IsEnum(MeetingType, {
    message: 'Please provide a valid meeting type',
  })
  @IsOptional()
  meetingType!: MeetingType;

  @IsEnum(MeetingStatus, {
    message: 'Please provide a valid meeting status',
  })
  @IsOptional()
  meetingStatus!: MeetingStatus;

  @IsDate({
    message: 'Please provide a valid date to schedule the meeting',
  })
  @Type(() => Date)
  @IsOptional()
  scheduledAt!: Date;
}
