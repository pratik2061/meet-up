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

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private readonly UserModel: Model<User>) {}

  async create(createAuthDto: CreateAuthDto): Promise<{
    message: string;
    user: Partial<User>;
  }> {
    try {
      const checkUser = await this.UserModel.findOne({
        email: createAuthDto.email,
      });

      if (checkUser) {
        throw new BadRequestException('User with email already exists');
      } else {
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
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the user',
      );
    }
  }

  // async signIn(){}
}
