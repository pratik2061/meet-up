import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from 'lib/prisma';
import { TokenPayLoad } from 'src/types/token.payload';
import bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class verifyToken {
  constructor(
    private readonly jwtServce: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async TokenVerification(token: string) {
    try {
      if (!token || typeof token !== 'string') {
        throw new BadRequestException('Invalid token format');
      }

      const decode: TokenPayLoad = this.jwtServce.verify(token, {
        secret: this.configService.get('REFRESH_SECRET'),
      });

      const getUser = await prisma.user.findUnique({
        where: { id: decode.id },
      });

      if (!getUser) {
        throw new BadRequestException('User not found');
      }

      if (!getUser.refreshToken) {
        throw new BadRequestException('Missing refresh token');
      }

      const isMatch = await bcrypt.compare(token, getUser.refreshToken);

      if (!isMatch) {
        throw new BadRequestException('Invalid refresh token');
      }

      return {
        isMatch,
        userId: decode.id,
        userEmail: decode.email,
        userCreatedAt: decode.createdAt,
      };
    } catch (error) {
      throw new BadRequestException('Token verification failed', {
        cause: error,
      });
    }
  }
}
