import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  BadRequestException,
  Get,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from 'src/schemas/user.schema';
import { LoginAuthDto } from './dto/login-auth.dto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { VerifyToken } from 'src/utils/verify-token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly verify: VerifyToken,
  ) {}

  @Post('register')
  async create(@Body() createAuthDto: CreateAuthDto): Promise<{
    message: string;
    user: Partial<User>;
  }> {
    return await this.authService.create(createAuthDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.signIn(loginAuthDto);

    res.cookie('accessToken', response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: this.configService.get('ACCESS_EXPIRES_IN') * 1000,
    });

    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: this.configService.get('REFRESH_EXPIRES_IN') * 1000,
    });

    return {
      message: 'login successful',
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'] as string;

    if (!refreshToken) {
      throw new BadRequestException('refresh token missing,please login');
    }
    const convertURIToken = decodeURIComponent(refreshToken);

    const userPayload:
      | {
          isMatch: boolean;
          userId: string;
        }
      | undefined = await this.verify.verifyToken(convertURIToken);

    if (!userPayload) {
      throw new BadRequestException('failed to verify token');
    }
    if (userPayload.isMatch) {
      const logoutResponse = await this.authService.logout(userPayload.userId);

      if (!logoutResponse || logoutResponse.status === false) {
        throw new BadRequestException('Failed to logout, please try again.');
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
  }

  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'] as string;
    const accessToken = req.cookies['accessToken'] as string;
    if (accessToken) {
      throw new BadRequestException(
        'Access token is still valid, no need to refresh',
      );
    }
    if (!refreshToken) {
      throw new UnauthorizedException('Tokens are missing, Please re-login');
    }
    const convertURIToken = decodeURIComponent(refreshToken);
    const response = await this.authService.refresh(convertURIToken);
    if (!response || !response.accessToken) {
      throw new BadRequestException(
        'failed to generate new access token, please re-login',
      );
    }
    res.cookie('accessToken', response.accessToken, {
      httpOnly: true,
      secure:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? true
          : false,
      maxAge: this.configService.get('ACCESS_EXPIRES_IN') * 1000,
    });
    return {
      message: 'Access token refreshed successfully',
    };
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const accessToken = req.cookies['accessToken'] as string;
    if (!accessToken) {
      throw new UnauthorizedException(
        'Access token is missing,Please login again',
      );
    }
    const convertURIToken = decodeURIComponent(accessToken);
    const userPayload:
      | {
          isMatch: boolean;
          userId: string;
        }
      | undefined = await this.verify.verifyToken(convertURIToken);

    if (!userPayload || !userPayload.isMatch || !userPayload.userId) {
      throw new BadRequestException('failed to verify token');
    }
    if (userPayload.isMatch) {
      const user = await this.authService.getMe(userPayload.userId);
      return {
        message: 'Your profile information retrieved successfully',
        user,
      };
    }
  }
}
