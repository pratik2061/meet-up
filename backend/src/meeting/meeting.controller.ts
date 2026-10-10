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
  constructor(private readonly meetingService: MeetingService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  createMeeting(
    @Body() createMeetingDto: CreateMeetingDto,
    @Req() req: Request,
  ) {
    const user = req.user as TokenPayLoad;
    console.log(user)
    if (!user || !user.id || !user.email || !user.createdAt) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }
    return this.meetingService.createMeeting(createMeetingDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllMeetings(@Req() req: Request) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id || !user.email || !user.createdAt) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }
    return this.meetingService.getAllMeetings(user.id);
  }

  @Get(':roomId')
  @UseGuards(JwtAuthGuard)
  getMeeting(@Param('roomId') roomId: string) {
    return this.meetingService.getMeeting(roomId);
  }

  @Get(':roomId/validate')
  @UseGuards(JwtAuthGuard)
  validateJoinMeeting(@Param('roomId') roomId: string, @Req() req: Request) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id || !user.email || !user.createdAt) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }
    return this.meetingService.ValidateJoinMeeting(roomId, user.id);
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
