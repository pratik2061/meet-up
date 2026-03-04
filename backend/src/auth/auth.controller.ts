import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  async create(@Body() createAuthDto: CreateAuthDto) {
    return await this.authService.create(createAuthDto);
  }

  @Post('signin')
  async signin(@Body() loginAuthDto: LoginAuthDto, @Res() res: Response) {
    const response = await this.authService.signin(loginAuthDto);
    if (!response) {
      throw new BadRequestException(
        "didn't received any response from service layer",
      );
    }
    res.cookie('accessToken', response.accessToken, {
      httpOnly: true,
      secure:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? true
          : false,
      maxAge: 900000,
    });
  }
}
