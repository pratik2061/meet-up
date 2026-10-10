import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecentLogController } from './recent-log.controller';
import { RecentLogService } from './recent-log.service';
import { RecentLogSchema } from 'src/schemas/recent-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'RecentLog', schema: RecentLogSchema }])
  ],
  controllers: [RecentLogController],
  providers: [RecentLogService],
  exports: [RecentLogService]
})
export class RecentLogModule {}
