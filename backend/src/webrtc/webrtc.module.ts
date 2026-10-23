import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';
import { ConfigModule } from '@nestjs/config';
import { MeetingModule } from 'src/meeting/meeting.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule, MeetingModule],
  providers: [WebrtcGateway, JwtService],
  exports: [WebrtcGateway],
})
export class WebrtcModule {}
