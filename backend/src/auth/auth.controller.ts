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

const badRequestSchema = {
  type: 'object',
  properties: {
    message: {
      oneOf: [
        {
          type: 'array',
          items: { type: 'string' },
        },
        {
          type: 'string',
        },
      ],
    },
    error: { type: 'string', example: 'Bad Request' },
    statusCode: { type: 'number', example: 400 },
  },
};

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
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'user created successfully',
        },
        resData: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '9c3db1b4-8f0c-4a3a-a5e4-5f51d8c1a6c8',
            },
            fullName: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'user@example.com' },
            phoneNumber: { type: 'string', example: '1234567890' },
            address: {
              type: 'string',
              example: '123 Main St, City, Country',
            },
            profileImageId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              example: null,
            },
            role: { type: 'string', example: 'USER' },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-05-22T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-05-22T10:30:00.000Z',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request / Validation Error.',
    content: {
      'application/json': {
        schema: badRequestSchema,
        examples: {
          validationError: {
            summary: 'DTO validation error',
            value: {
              message: ['email must be an email'],
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          duplicateEmail: {
            summary: 'Email already exists',
            value: {
              message: 'user with this email already exists',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Internal server error' },
        statusCode: { type: 'number', example: 500 },
      },
    },
  })
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
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials.',
    content: {
      'application/json': {
        schema: badRequestSchema,
        examples: {
          validationError: {
            summary: 'DTO validation error',
            value: {
              message: ['password must be between 8 and 50 characters long'],
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          userNotFound: {
            summary: 'User not found',
            value: {
              message: 'user with this email doesnot exists',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          invalidPassword: {
            summary: 'Invalid password',
            value: {
              message: 'invalid email or password',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Internal server error' },
        statusCode: { type: 'number', example: 500 },
      },
    },
  })
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
  @ApiResponse({
    status: 200,
    description: 'Logout successful.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout successful' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token missing or invalid.',
    content: {
      'application/json': {
        schema: badRequestSchema,
        examples: {
          missingRefreshToken: {
            summary: 'Missing refresh token cookie',
            value: {
              message: 'Refresh token missing, please login',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          logoutFailed: {
            summary: 'Logout update failed',
            value: {
              message: 'Failed to logout, please try again',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          userMissing: {
            summary: 'User not found',
            value: {
              message: 'user doesnot exists',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Internal server error' },
        statusCode: { type: 'number', example: 500 },
      },
    },
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
  @ApiResponse({
    status: 200,
    description: 'Access token refresh successful.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Access Token refresh successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Tokens missing or invalid.',
    content: {
      'application/json': {
        schema: badRequestSchema,
        examples: {
          tokensMissing: {
            summary: 'Both tokens missing',
            value: {
              message: 'Tokens are missing, please re-login',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          accessTokenStillPresent: {
            summary: 'Refresh not needed',
            value: {
              message: 'Access token is still there, no need to refresh',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          missingRefreshToken: {
            summary: 'Missing refresh token',
            value: {
              message: 'Refresh token missing,please re-login',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          verificationFailed: {
            summary: 'Refresh token verification failed',
            value: {
              message: 'Token verification failed',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
          generationFailed: {
            summary: 'Access token generation failed',
            value: {
              message: 'Failed to generate new access token, please re-login',
              error: 'Bad Request',
              statusCode: 400,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Internal server error' },
        statusCode: { type: 'number', example: 500 },
      },
    },
  })
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
