import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import type { Request } from 'express';
import { TokenPayLoad } from 'src/types/tokenPayload';

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  createMeeting(
    @Body() createMeetingDto: CreateMeetingDto,
    @Req() req: Request,
  ) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id || !user.email || !user.createdAt) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }
    return this.meetingService.createMeeting(createMeetingDto, user.id);
  }
}
