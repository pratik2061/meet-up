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
import { TokenGenerate } from 'src/utils/token.generate';
import { verifyToken } from 'src/utils/verify.token';
@Injectable()
export class AuthService {
  constructor(
    private readonly token: TokenGenerate,
    private readonly verifyTokenService: verifyToken,
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
          profileImageId: createAuthDto.profileImageId,
        },
      });
      const { password, ...resData } = createUser;
      return {
        message: 'user created successfully',
        resData,
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

      const userPayload = {
        id: checkUser.id,
        email: checkUser.email,
        createdAt: checkUser.createdAt,
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
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async logout(id: string) {
    try {
      const checkUser = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      if (!checkUser) {
        throw new BadRequestException('user doesnot exists');
      }
      await prisma.user.update({
        where: {
          id: checkUser.id,
        },
        data: {
          refreshToken: null,
        },
      });
      return { status: true };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async refresh(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new BadRequestException("Didn't received a refreshToken");
      }
      const result =
        await this.verifyTokenService.TokenVerification(refreshToken);

      if (!result || !result.isMatch) {
        throw new BadRequestException(
          'No any response from token  verification or invalid token',
        );
      }
      const payload: TokenPayLoad = {
        id: result.userId,
        email: result.userEmail,
        createdAt: result.userCreatedAt,
      };
      const { accessToken } = this.token.generateToken(payload);
      return { accessToken };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
