import { IsEnum } from 'class-validator';
import { FriendshipStatus } from 'src/schemas/friendship.schema';

export class RespondFriendRequestDto {
  @IsEnum(FriendshipStatus, {
    message: 'Status must be either ACCEPTED or REJECTED',
  })
  status!: FriendshipStatus;
}
