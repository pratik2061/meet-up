import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  BadRequestException,
  Get,
  HttpCode,
  Patch,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from 'src/schemas/user.schema';
import { LoginAuthDto } from './dto/login-auth.dto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { VerifyToken } from 'src/utils/verify-token';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthGuard } from 'src/strategy/auth/google.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly verify: VerifyToken,
  ) { }

  private getCookieOptions(type: 'access' | 'refresh') {
    const isProd =
      this.configService.get<string>('NODE_ENV') ===
      'production';
    const accessExpires = Number(
      this.configService.get('ACCESS_EXPIRES_IN'),
    );
    const refreshExpires = Number(
      this.configService.get('REFRESH_EXPIRES_IN'),
    );
    const maxAge = (type === 'access' ? accessExpires : refreshExpires) * 1000;

    return {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
      maxAge,
      path: '/',
    };
  }

  private getClearCookieOptions() {
    const isProd =
      this.configService.get<string>('NODE_ENV') ===
      'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };
  }

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

    res.cookie(
      'accessToken',
      response.accessToken,
      this.getCookieOptions('access'),
    );

    res.cookie(
      'refreshToken',
      response.refreshToken,
      this.getCookieOptions('refresh'),
    );

    return {
      message: 'login successful',
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    res.clearCookie('accessToken', this.getClearCookieOptions());
    res.clearCookie('refreshToken', this.getClearCookieOptions());

    const refreshToken = req.cookies?.['refreshToken'] as string | undefined;

    if (refreshToken) {
      try {
        const convertURIToken = decodeURIComponent(refreshToken);
        const userPayload = await this.verify.verifyToken(convertURIToken);
        if (userPayload?.isMatch && userPayload?.userId) {
          await this.authService.logout(userPayload.userId);
        }
      } catch {
        // Even if token was expired or invalid, cookies are cleared
      }
    }

    return {
      message: 'Logout successful',
    };
  }

  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refreshToken'] as string | undefined;

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
    res.cookie(
      'accessToken',
      response.accessToken,
      this.getCookieOptions('access'),
    );
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
    const response = await this.authService.getMe(convertURIToken);
    if (!response) {
      throw new BadRequestException('Failed to fetch user details');
    }
    return {
      message: 'User details fetched successfully',
      data: response,
    };
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: Request,
    @Body() updateAuthDto: UpdateProfileDto,
  ) {
    const accessToken = req.cookies['accessToken'] as string;
    if (!accessToken) {
      throw new UnauthorizedException(
        'Access token is missing, Please login again',
      );
    }
    const convertURIToken = decodeURIComponent(accessToken);
    const response = await this.authService.updateProfile(
      convertURIToken,
      updateAuthDto,
    );
    return {
      message: 'Profile updated successfully',
      data: response,
    };
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.requestPasswordReset(forgotPasswordDto.email);
  }
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Passport redirects to Google login page automatically
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const googleUser = req.user as {
        googleId: string;
        email: string;
        fullName: string;
        avatarUrl?: string;
      };

      const tokens = await this.authService.googleLogin(googleUser);

      // Store tokens in Redis with a one-time code instead of setting cookies
      // on the redirect response (cookies on 302 redirects are unreliable cross-origin)
      const code = await this.authService.storeGoogleAuthCode(tokens);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(`${frontendUrl}/auth/callback?code=${code}`);
    } catch {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
  }

  @Post('google/exchange')
  @HttpCode(200)
  async exchangeGoogleCode(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    const tokens = await this.authService.exchangeGoogleAuthCode(code);

    const accessMaxAge = Number(this.configService.get('ACCESS_EXPIRES_IN')) * 1000;
    const refreshMaxAge = Number(this.configService.get('REFRESH_EXPIRES_IN')) * 1000;

    console.log('[Google Exchange] accessToken present:', !!tokens.accessToken, 'length:', tokens.accessToken?.length);
    console.log('[Google Exchange] refreshToken present:', !!tokens.refreshToken, 'length:', tokens.refreshToken?.length);
    console.log('[Google Exchange] accessMaxAge:', accessMaxAge, 'refreshMaxAge:', refreshMaxAge);

    res.cookie(
      'accessToken',
      tokens.accessToken,
      this.getCookieOptions('access'),
    );

    res.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.getCookieOptions('refresh'),
    );

    return {
      message: 'Google login successful',
    };
  }

}

