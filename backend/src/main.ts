import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    new ValidationPipe({
      whitelist: true,
      validateCustomDecorators: true,
      transform: true,
    }),
  );
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
