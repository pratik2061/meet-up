import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WebrtcModule } from './webrtc/webrtc.module';
import { MeetingModule } from './meeting/meeting.module';
import { RedisModule } from './redis/redis.module';
import { RecentLogModule } from './recent-log/recent-log.module';
import { ReportModule } from './report/report.module';
import { MailModule } from './resend/resend.module';
import { MailService } from './resend/resend.service';
import { FriendModule } from './friend/friend.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    AuthModule,

    WebrtcModule,

    MeetingModule,

    RedisModule,

    RecentLogModule,

    ReportModule,

    MailModule,

    FriendModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule { }
