import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';

async function bootstrap() {
  const allowedOrigins = (process.env.FRONTEND_URL!)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (process.env.NODE_ENV !== 'production') {
          if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
          }
        }
        callback(new Error('Not allowed by CORS'));
      },
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
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
