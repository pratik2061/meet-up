import { IsEmail, IsMongoId, IsOptional, ValidateIf } from 'class-validator';

export class CreateFriendRequestDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid recipient user ID' })
  recipientId?: string;

  @ValidateIf((o) => !o.email && !o.recipientId)
  mustProvideOne?: string;
}
