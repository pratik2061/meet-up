import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendshipSchema } from 'src/schemas/friendship.schema';
import { UserSchema } from 'src/schemas/user.schema';
import { RecentLogModule } from 'src/recent-log/recent-log.module';
import { WebrtcModule } from 'src/webrtc/webrtc.module';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Friendship', schema: FriendshipSchema },
      { name: 'User', schema: UserSchema },
    ]),
    RecentLogModule,
    WebrtcModule,
  ],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService],
})
export class FriendModule {}
