import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [WebrtcGateway],
})
export class WebrtcModule {}
