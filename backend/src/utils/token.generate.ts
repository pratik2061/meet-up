import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayLoad } from 'src/types/token.payload';

@Injectable()
export class TokenGenerate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(payload: TokenPayLoad) {
    try {
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('ACCESS_SECRET'),
        expiresIn: Number(this.configService.get<number>('ACCESS_EXPIRES_IN')),
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('REFRESH_SECRET'),
        expiresIn: Number(this.configService.get<number>('REFRESH_EXPIRES_IN')),
      });
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
