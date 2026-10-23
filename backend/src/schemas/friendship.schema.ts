import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from './user.schema';

export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Friendship extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  requester!: Types.ObjectId | User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  recipient!: Types.ObjectId | User;

  @Prop({
    type: String,
    enum: Object.values(FriendshipStatus),
    default: FriendshipStatus.PENDING,
    index: true,
  })
  status!: FriendshipStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

// Compound index to ensure uniqueness of friendship pairs
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
