import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { TokenPayLoad } from 'src/types/tokenPayload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenGenerate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(payload: TokenPayLoad) {
    try {
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('ACCESS_SECRET'),
        expiresIn: Number(this.configService.get<string>('ACCESS_EXPIRES_IN')),
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('REFRESH_SECRET'),
        expiresIn: Number(this.configService.get<string>('REFRESH_EXPIRES_IN')),
      });
      if (!accessToken || !refreshToken) {
        throw new BadRequestException('Failed to generate tokens');
      }

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while generating the token',
        {
          cause: error,
        },
      );
    }
  }
}
