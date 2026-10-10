import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class RecentLog extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user!: User | Types.ObjectId | string;

  @Prop({ required: true })
  action!: string;

  @Prop()
  description?: string;
}

export const RecentLogSchema = SchemaFactory.createForClass(RecentLog);
