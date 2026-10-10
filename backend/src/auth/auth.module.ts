import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/user.schema';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from 'src/strategy/jwt.strategy';
import { TokenGenerate } from 'src/utils/token-generate';
import { VerifyToken } from 'src/utils/verify-token';
import { JwtService } from '@nestjs/jwt';
import { RecentLogModule } from 'src/recent-log/recent-log.module';

@Module({
  imports: [
    ConfigModule,
    RecentLogModule,
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenGenerate, VerifyToken, JwtService],
})
export class AuthModule { }
