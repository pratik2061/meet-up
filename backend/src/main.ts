import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Meet Up API')
    .setDescription('The Meet Up application API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
