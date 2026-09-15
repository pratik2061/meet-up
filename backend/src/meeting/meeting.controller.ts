import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import type { Request } from 'express';
import { TokenPayLoad } from 'src/types/tokenPayload';
import { JwtAuthGuard } from 'src/strategy/auth/jwt-auth.guard';

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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

  @Get(':roomId')
  @UseGuards(JwtAuthGuard)
  getMeeting(@Param('roomId') roomId: string) {
    return this.meetingService.getMeeting(roomId);
  }

  @Post(':roomId/end')
  @UseGuards(JwtAuthGuard)
  end(@Req() req: Request, @Param('roomId') roomId: string) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id || !user.email || !user.createdAt) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }
    return this.meetingService.endMeeting(roomId, user.id);
  }
}
