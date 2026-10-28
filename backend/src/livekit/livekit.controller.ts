import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/strategy/auth/jwt-auth.guard';
import { TokenPayLoad } from 'src/types/tokenPayload';
import { MeetingService } from 'src/meeting/meeting.service';
import { LiveKitService } from './livekit.service';

@Controller('livekit')
export class LiveKitController {
  constructor(
    private readonly livekitService: LiveKitService,
    private readonly meetingService: MeetingService,
  ) {}

  @Get(':roomId/token')
  @UseGuards(JwtAuthGuard)
  async getToken(@Param('roomId') roomId: string, @Req() req: Request) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id || !user.email) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }

    if (!roomId) {
      throw new BadRequestException('Room ID is required');
    }

    // Validate meeting access and status
    const validation = await this.meetingService.ValidateJoinMeeting(
      roomId,
      user.id,
    );

    if (!validation || !validation.isValid || !validation.meetingDetails) {
      throw new BadRequestException('Invalid meeting room or permission denied');
    }

    const meetingHost = validation.meetingDetails.host as any;
    const hostId = meetingHost?._id?.toString() || meetingHost?.toString();
    const isHost = hostId === user.id.toString();

    // Mark user as joined in database
    await this.meetingService.markUserJoined(roomId, user.id);

    return this.livekitService.createToken({
      roomId,
      userId: user.id,
      userEmail: user.email,
      isHost,
    });
  }
}
