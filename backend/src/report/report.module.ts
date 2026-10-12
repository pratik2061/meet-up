import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingSchema } from 'src/schemas/meeting.schema';
import { UserSchema } from 'src/schemas/user.schema';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Meeting', schema: MeetingSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
