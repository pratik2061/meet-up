import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      validateCustomDecorators: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    Credential: true,
    origin: process.env.CLIENT_URL,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
