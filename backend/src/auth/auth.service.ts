import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TokenPayLoad } from 'src/types/tokenPayload';
import { TokenGenerate } from 'src/utils/token-generate';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly UserModel: Model<User>,
    private readonly token: TokenGenerate,
  ) {}

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
      );
    }
  }

  async signIn(loginAuthDto: LoginAuthDto) {
    try {
      const user = await this.UserModel.findOne({
        email: loginAuthDto.email,
      });
      if (!user) {
        throw new BadRequestException('User with this email does not exist');
      }
      const isPasswordValid = await bcrypt.compare(
        loginAuthDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid email or passoword');
      }
      const userPayload: TokenPayLoad = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };

      const { accessToken, refreshToken } =
        this.token.generateToken(userPayload);

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.UserModel.findByIdAndUpdate(user._id, {
        refreshToken: hashedRefreshToken,
      });
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while signing in',
      );
    }
  }
}
