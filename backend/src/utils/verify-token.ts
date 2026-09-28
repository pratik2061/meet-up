import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { TokenPayLoad } from 'src/types/tokenPayload';
import bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class VerifyToken {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectModel('User') private readonly UserModel: Model<User>,
  ) {}

  async verifyToken(token: string) {
    try {
      const decode: TokenPayLoad = this.jwtService.verify(token, {
        secret: this.configService.get<string>('REFRESH_SECRET'),
      });
      const getUser = await this.UserModel.findById(decode.id).select(
        '+refreshToken',
      );

      if (!getUser) {
        throw new NotFoundException('User not found');
      }
      if (!getUser.refreshToken) {
        throw new UnauthorizedException('missing refresh token');
      }

      const isMatch = await bcrypt.compare(token, getUser.refreshToken);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return {
        isMatch,
        userId: decode.id,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.name === 'JsonWebTokenError' ||
          error.name === 'TokenExpiredError' ||
          error.name === 'NotBeforeError'
        ) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while verifying the token',
      );
    }
  }
}
