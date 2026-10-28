import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MeetingModule } from 'src/meeting/meeting.module';
import { LiveKitService } from './livekit.service';
import { LiveKitController } from './livekit.controller';

@Module({
  imports: [ConfigModule, MeetingModule],
  controllers: [LiveKitController],
  providers: [LiveKitService],
  exports: [LiveKitService],
})
export class LiveKitModule {}
