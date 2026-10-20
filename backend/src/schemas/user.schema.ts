import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  // Made optional for OAuth users
  @Prop({ required: false, select: false })
  password?: string;

  // Made optional for OAuth users
  @Prop({ required: false })
  phoneNumber?: string;

  // Made optional for OAuth users
  @Prop({ required: false })
  address?: string;

  @Prop({ type: String, enum: AuthProvider, default: AuthProvider.LOCAL })
  provider!: AuthProvider;

  @Prop({ required: false })
  googleId?: string;

  @Prop({ required: false })
  avatarUrl?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ select: false })
  refreshToken?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
