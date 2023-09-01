import { LoggerService, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { WinstonModule, utilities } from 'nest-winston';
import winston from 'winston';
import { AppModule } from './app/app.module';
const MemoryStore = createMemoryStore(session);

function createLogger(): LoggerService {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          utilities.format.nestLike('bship'),
        ),
      }),
    ],
  });
}

async function bootstrap() {
  const SESSION_MAXAGE = 86400000; // 24 hr
  const app = await NestFactory.create(AppModule, {
    logger: createLogger(),
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useWebSocketAdapter(new WsAdapter(app));
  app.setGlobalPrefix('api');
  app.use(
    session({
      name: 'bship_session',
      secret: 'shush!',
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, secure: true, sameSite: true, maxAge: SESSION_MAXAGE },
      store: new MemoryStore({
        checkPeriod: SESSION_MAXAGE,
      }),
    }),
  );
  await app.listen(3001);
}
bootstrap();
