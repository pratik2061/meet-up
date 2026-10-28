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
import { AuthProvider, User } from 'src/schemas/user.schema';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TokenPayLoad } from 'src/types/tokenPayload';
import { TokenGenerate } from 'src/utils/token-generate';
import { VerifyToken } from 'src/utils/verify-token';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';
import { RecentLogService } from 'src/recent-log/recent-log.service';
import crypto from 'crypto'
import { MailService } from 'src/resend/resend.service';
import { UploadService } from 'src/upload/upload.service';

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
    private readonly mailService: MailService,
    private readonly uploadService: UploadService,
  ) { }

  async create(
    createAuthDto: CreateAuthDto,
    file?: Express.Multer.File,
  ): Promise<{
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

      let avatarUrl: string | undefined;
      if (file) {
        const uploadResult = await this.uploadService.uploadToR2(file);
        avatarUrl = uploadResult.url;
      }

      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
      const createUser = await this.UserModel.create({
        ...createAuthDto,
        password: hashedPassword,
        avatarUrl,
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
      if (user.provider === AuthProvider.GOOGLE) {
        throw new UnauthorizedException("User is registered with Google, Please login with Google")
      }
      const isPasswordValid = await bcrypt.compare(
        loginAuthDto.password,
        user.password!,
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

      await this.redisService.client.del(`user:${userId}`);

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
      );
      return userDetail;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.name === 'JsonWebTokenError' ||
          error.name === 'TokenExpiredError' ||
          error.name === 'NotBeforeError'
        ) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }
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

  async updateProfile(
    token: string,
    updateData: { fullName?: string; phoneNumber?: string; address?: string },
    file?: Express.Multer.File,
  ) {
    try {
      const verifyAccessToken: TokenPayLoad = this.jwtService.verify(token, {
        secret: this.configService.get<string>('ACCESS_SECRET'),
      });
      if (!verifyAccessToken || !verifyAccessToken.id) {
        throw new UnauthorizedException('Invalid access token');
      }

      let avatarUrl: string | undefined;
      if (file) {
        const uploadResult = await this.uploadService.uploadToR2(file);
        avatarUrl = uploadResult.url;
      }

      const updatedUser = await this.UserModel.findByIdAndUpdate(
        verifyAccessToken.id,
        {
          ...(updateData.fullName && { fullName: updateData.fullName }),
          ...(updateData.phoneNumber && { phoneNumber: updateData.phoneNumber }),
          ...(updateData.address && { address: updateData.address }),
          ...(avatarUrl && { avatarUrl }),
        },
        { returnDocument: 'after' },
      );

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      await this.redisService.client.set(
        `user:${updatedUser.id}`,
        JSON.stringify(updatedUser),
        'EX',
        Number(this.configService.get('REDIS_TTL')!),
      );

      await this.recentLogService.createLog(
        updatedUser.id,
        'Profile Updated',
        'User updated profile information',
      );

      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.name === 'JsonWebTokenError' ||
          error.name === 'TokenExpiredError' ||
          error.name === 'NotBeforeError'
        ) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while updating profile',
        {
          cause: error,
        },
      );
    }
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const user = await this.UserModel.findOne({ email });
      if (!user) {
        return {
          message: 'If an account exists with this email, a reset link has been sent.',
        };
      }
      const resetToken = crypto.randomBytes(32).toString('hex');
      await this.redisService.client.set(
        `password_reset:${resetToken}`,
        user._id.toString(),
        'EX',
        900,
      );
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL')
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`

      await this.mailService.sendPasswordResetEmail(user.email, resetLink);

      await this.recentLogService.createLog(
        user.id,
        'Password Reset Requested',
        'A reset link was sent to user email',
      );
      return {
        message: 'If an account exists with this email, a reset link has been sent.',
      };
    } catch (error) {
      throw new InternalServerErrorException("An error occurred while requesting password reset",)
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const userId = await this.redisService.client.get(`password_reset:${token}`);
      if (!userId) {
        throw new BadRequestException('Invalid or expired reset token');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await this.UserModel.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { returnDocument: 'after' },
      );

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      await this.redisService.client.del(`password_reset:${token}`);
      await this.redisService.client.del(`user:${userId}`);

      await this.recentLogService.createLog(
        userId,
        'Password Changed',
        'Password was successfully updated using reset link',
      );

      return {
        message: 'Password has been successfully updated. You can now login.',
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("An error occurred while resetting password")
    }
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  }) {
    if (!googleUser.email) {
      throw new BadRequestException('No email provided by Google');
    }

    let avatarUrl = googleUser.avatarUrl;
    if (googleUser.avatarUrl) {
      const highResUrl = googleUser.avatarUrl.replace(/=s\d+(-c)?$/, '=s400-c');
      const uploadResult = await this.uploadService.uploadFromUrl(highResUrl);
      if (uploadResult?.url) {
        avatarUrl = uploadResult.url;
      }
    }

    // Check if user already exists
    let user = await this.UserModel.findOne({ email: googleUser.email });

    if (!user) {
      //Create new user if not found
      user = await this.UserModel.create({
        email: googleUser.email,
        fullName: googleUser.fullName,
        googleId: googleUser.googleId,
        avatarUrl,
        provider: AuthProvider.GOOGLE,
      });

      await this.recentLogService.createLog(
        user.id,
        'User Google Signup',
        'User registered via Google OAuth',
      );
    } else {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        needsSave = true;
      }
      if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    //Generate tokens
    const userPayload: TokenPayLoad = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };

    const { accessToken, refreshToken } =
      this.token.generateToken(userPayload);

    //Save hashed refresh token & cache user in Redis
    const { password: _password, ...restData } = user.toJSON();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.UserModel.findByIdAndUpdate(user._id, {
      refreshToken: hashedRefreshToken,
    });

    await this.redisService.client.set(
      `user:${user.id}`,
      JSON.stringify(restData),
      'EX',
      Number(this.configService.get('REDIS_TTL')!),
    );

    await this.recentLogService.createLog(
      user.id,
      'User Google Login',
      'User logged in via Google OAuth',
    );

    return { accessToken, refreshToken };
  }


  async storeGoogleAuthCode(tokens: {
    accessToken: string;
    refreshToken: string;
  }): Promise<string> {
    const code = crypto.randomBytes(32).toString('hex');
    await this.redisService.client.set(
      `google_auth_code:${code}`,
      JSON.stringify(tokens),
      'EX',
      30, // 30 second TTL — just enough time for the frontend to exchange it
    );
    return code;
  }


  async exchangeGoogleAuthCode(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const key = `google_auth_code:${code}`;
    const data = await this.redisService.client.get(key);

    if (!data) {
      throw new UnauthorizedException(
        'Invalid or expired authorization code',
      );
    }

    // Delete immediately so the code can't be reused
    await this.redisService.client.del(key);

    return JSON.parse(data) as { accessToken: string; refreshToken: string };
  }

}