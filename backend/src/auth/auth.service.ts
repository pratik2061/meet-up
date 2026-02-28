import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { prisma } from 'lib/prisma';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Role } from '@prisma/client';
import { LoginAuthDto } from './dto/login-auth.dto';
@Injectable()
export class AuthService {
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
          role: Role.USER,
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
