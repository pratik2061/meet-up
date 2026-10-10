import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TokenPayLoad } from 'src/types/tokenPayload';
import { TokenGenerate } from 'src/utils/token-generate';
import { VerifyToken } from 'src/utils/verify-token';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';
import { RecentLogService } from 'src/recent-log/recent-log.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly UserModel: Model<User>,
    private readonly token: TokenGenerate,
    private readonly verify: VerifyToken,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly recentLogService: RecentLogService,
  ) { }

  async create(createAuthDto: CreateAuthDto): Promise<{
    message: string;
    user: Partial<User>;
  }> {
    try {
      const checkUser = await this.UserModel.findOne({
        email: createAuthDto.email,
      });

      if (checkUser) {
        throw new BadRequestException('User with this email already exists');
      }
      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
      const createUser = await this.UserModel.create({
        ...createAuthDto,
        password: hashedPassword,
      });
      const { password: _password, ...userData } = createUser.toObject();

      await this.recentLogService.createLog(
        createUser.id,
        'User Signup',
        'User registered a new account'
      );

      return {
        message: 'User created successfully',
        user: userData,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the user',
        {
          cause: error,
        },
      );
    }
  }

  async signIn(loginAuthDto: LoginAuthDto) {
    try {
      const user = await this.UserModel.findOne({
        email: loginAuthDto.email,
      }).select('+password');
      if (!user) {
        throw new NotFoundException('User with this email does not exist');
      }

      const isPasswordValid = await bcrypt.compare(
        loginAuthDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }
      const userPayload: TokenPayLoad = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
      const { accessToken, refreshToken } =
        this.token.generateToken(userPayload);

      const { password: _password, ...restData } = user.toJSON()

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.UserModel.findByIdAndUpdate(user._id, {
        refreshToken: hashedRefreshToken,
      });

      await this.redisService.client.set(`user:${user.id}`, JSON.stringify(restData), 'EX', Number(this.configService.get('REDIS_TTL')!))

      await this.recentLogService.createLog(
        user.id,
        'User Login',
        'User signed into their account'
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while signing in',
      );
    }
  }

  async logout(userId: string) {
    try {
      const user = await this.UserModel.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.UserModel.findByIdAndUpdate(userId, {
        refreshToken: null,
      });

      await this.recentLogService.createLog(
        userId,
        'User Logout',
        'User logged out of their account'
      );

      return {
        status: true,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while logging out',
        {
          cause: error,
        },
      );
    }
  }

  async refresh(refreshToken: string) {
    try {
      const verifyToken = await this.verify.verifyToken(refreshToken);
      if (!verifyToken) {
        throw new UnauthorizedException(
          'No any response from token verification or invalid token',
        );
      }
      if (verifyToken.isMatch) {
        const user = await this.UserModel.findById(verifyToken.userId);

        if (!user) {
          throw new NotFoundException('User not found');
        }
        const payload: TokenPayLoad = {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        };
        const { accessToken } = this.token.generateToken(payload);

        return {
          accessToken,
        };
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while refreshing the token',
        {
          cause: error,
        },
      );
    }
  }

  async getMe(token: string) {
    try {
      const verifyAccessToken: TokenPayLoad = this.jwtService.verify(token, {
        secret: this.configService.get<string>('ACCESS_SECRET'),
      });
      if (!verifyAccessToken || !verifyAccessToken.id) {
        throw new UnauthorizedException('Invalid access token');
      }
      const checkRedis = await this.redisService.client.get(
        `user:${verifyAccessToken.id}`
      )
      if (checkRedis) {
        return JSON.parse(checkRedis)
      }
      const userDetail = await this.UserModel.findById(verifyAccessToken.id);
      if (!userDetail) {
        throw new NotFoundException('User not found');
      }
      await this.redisService.client.set(
        `user:${userDetail.id}`,
        JSON.stringify(userDetail),
        'EX',
        Number(this.configService.get('REDIS_TTL')!)
      )
      return userDetail;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching user data',
      );
    }
  }
}
