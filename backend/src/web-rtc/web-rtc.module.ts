import { Module } from '@nestjs/common';
import { WebRtcService } from './web-rtc.service';
import { WebRtcController } from './web-rtc.controller';

@Module({
  controllers: [WebRtcController],
  providers: [WebRtcService],
})
export class WebRtcModule {}
