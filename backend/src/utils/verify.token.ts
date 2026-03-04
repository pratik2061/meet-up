import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayLoad } from 'src/types/token.payload';

@Injectable()
export class verifyToken {
  constructor(private readonly jwtServce: JwtService) {}

  async TokenVerification(token: string) {
    try {
      const decode: TokenPayLoad = await this.jwtServce.verify(token);
      console.log(decode);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error ');
    }
  }
}
