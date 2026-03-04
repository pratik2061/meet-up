import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Request, Response } from 'express';
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
  async signin(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.signin(loginAuthDto);
    res.cookie('accessToken', response.accessToken, {
      httpOnly: true,
      secure:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? true
          : false,
      maxAge: 900000,
    });
    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      secure:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? true
          : false,
      maxAge: 604800000,
    });

    return {
      message: 'Login successful',
    };
  }

  @Post('refresh')
  refresh(@Req() req: Request) {
    const accessToken = req.cookies['accessToken'] as string;
    const refreshToken = req.cookies['refreshToken'] as string;

    if (!accessToken && !refreshToken) {
      throw new BadRequestException('Tokens are missing, please re-login');
    }
    if (accessToken) {
      throw new BadRequestException(
        'Access token is still valid, no need to refresh',
      );
    }
  }
}
