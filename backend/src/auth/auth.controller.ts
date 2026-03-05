import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayLoad } from 'src/types/token.payload';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  async create(@Body() createAuthDto: CreateAuthDto) {
    return await this.authService.create(createAuthDto);
  }

  @Post('signin')
  @HttpCode(200)
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

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'] as string;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token missing, please login');
    }
    const URIformendToken = decodeURIComponent(refreshToken);
    const userPayload: TokenPayLoad = this.jwtService.verify(URIformendToken);
    const result = await this.authService.logout(userPayload.id);
    if (!result || !result.status) {
      throw new BadRequestException('Failed to logout, please try again');
    }
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? true
          : false,
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? true
          : false,
    });
    return {
      message: 'Logout successful',
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = req.cookies['accessToken'] as string;
    const refreshToken = req.cookies['refreshToken'] as string;

    if (!accessToken && !refreshToken) {
      throw new BadRequestException('Tokens are missing, please re-login');
    }
    if (accessToken) {
      throw new BadRequestException(
        'Access token is still there, no need to refresh',
      );
    }
    if (!refreshToken) {
      throw new BadRequestException('Refresh token missing,please re-login');
    }
    const URIformendToken = decodeURIComponent(refreshToken);
    const response = await this.authService.refresh(URIformendToken);

    if (!response.accessToken) {
      throw new BadRequestException(
        'Failed to generate new access token, please re-login',
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
    return { message: 'Access Token refresh successfully' };
  }
}
