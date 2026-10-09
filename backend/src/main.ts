import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.FRONTEND_URL?.split(','),
      credentials: true,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      validateCustomDecorators: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.use(cookieParser());

  app.setGlobalPrefix('api');
  const http = app.getHttpAdapter()
  http.get('/api/health', (_req: Request, res: Response) => {
    res.send("server is healthy")
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
