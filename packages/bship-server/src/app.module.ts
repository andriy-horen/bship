import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { CommonModule } from './common.module';
import { defaultConfiguration } from './config/configuration';
import { GameModule } from './game.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // TODO: path below should not be hardcoded
      rootPath: join(__dirname, '../../..', 'bship-app', 'dist'),
      exclude: ['/api*'],
    }),
    ConfigModule.forRoot({ load: [defaultConfiguration], isGlobal: true }),
    CommonModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule {}
