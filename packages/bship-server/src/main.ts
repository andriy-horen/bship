import { LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { utilities, WinstonModule } from 'nest-winston';
import winston from 'winston';
import { name as appName } from '../package.json';
import { AppModule } from './app.module';

function createLogger(): LoggerService {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          utilities.format.nestLike(appName)
        ),
      }),
    ],
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createLogger(),
  });
  app.useWebSocketAdapter(new WsAdapter(app));
  app.setGlobalPrefix('api');
  await app.listen(3001);
}
bootstrap();
