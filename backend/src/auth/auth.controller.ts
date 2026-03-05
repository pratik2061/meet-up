import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { TokenPayLoad } from 'src/types/token.payload';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'User Signup', description: 'Register a new user.' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request / Validation Error.' })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('signup')
  async create(@Body() createAuthDto: CreateAuthDto) {
    return await this.authService.create(createAuthDto);
  }

  @ApiOperation({
    summary: 'User Signin',
    description: 'Login to the application.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Sets access and refresh tokens in cookies.',
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
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

  @ApiOperation({
    summary: 'User Logout',
    description: 'Logout by clearing tokens.',
  })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @ApiResponse({
    status: 400,
    description: 'Refresh token missing or invalid.',
  })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
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

  @ApiOperation({
    summary: 'Refresh Tokens',
    description: 'Refresh access token using refresh token cookie.',
  })
  @ApiResponse({ status: 200, description: 'Access token refresh successful.' })
  @ApiResponse({ status: 400, description: 'Tokens missing or invalid.' })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
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
