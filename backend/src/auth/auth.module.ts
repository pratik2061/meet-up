import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenGenerate } from 'src/utils/token.generate';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TokenGenerate],
})
export class AuthModule {}
