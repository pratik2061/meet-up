import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { prisma } from 'lib/prisma';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TokenPayLoad } from 'src/types/token.payload';
import { ConfigService } from '@nestjs/config';
import { TokenGenerate } from 'src/utils/token.generate';
import { access } from 'node:fs';
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly token: TokenGenerate,
  ) {}
  async create(createAuthDto: CreateAuthDto) {
    try {
      const checkUser = await prisma.user.findUnique({
        where: {
          email: createAuthDto.email,
        },
      });
      if (checkUser) {
        throw new BadRequestException('user with this email already exists');
      }
      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
      const createUser = await prisma.user.create({
        data: {
          fullName: createAuthDto.fullName,
          email: createAuthDto.email,
          password: hashedPassword,
          phoneNumber: createAuthDto.phoneNumber,
          address: createAuthDto.address,
          image: createAuthDto.image as string,
        },
      });
      return {
        message: 'user created successfully',
        createUser,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async signin(loginAuthDto: LoginAuthDto) {
    try {
      const checkUser = await prisma.user.findUnique({
        where: {
          email: loginAuthDto.email,
        },
      });
      if (!checkUser) {
        throw new BadRequestException('user with this email doesnot exists');
      }
      const isPasswordValid = await bcrypt.compare(
        loginAuthDto.password,
        checkUser.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('invalid email or password');
      }
      const expirationTime =
        this.configService.get<number>('ACCESS_EXPIRES_IN');
      const userPayload = {
        id: checkUser.id,
        email: checkUser.email,
        createdAt: checkUser.createdAt,
        exp: Math.floor(Date.now() / 1000) + expirationTime!,
      } as TokenPayLoad;
      const { accessToken, refreshToken } =
        this.token.generateToken(userPayload);

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await prisma.user.update({
        where: {
          id: checkUser.id,
        },
        data: {
          refreshToken: hashedRefreshToken,
        },
      });
      return {
        accessToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
