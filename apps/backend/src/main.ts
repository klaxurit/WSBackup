import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const allowedOrigins = [
  /\.winnieswap\.com$/,
  'https://www.winnieswap.com',
  'https://winnieswap.com',
  'http://localhost:5173',
  /\.winnieswap\.pages\.dev$/,
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: allowedOrigins,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
