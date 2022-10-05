import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { CommonModule } from './common.module';
import { defaultConfiguration } from './config/configuration';
import { GameModule } from './game.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [defaultConfiguration], isGlobal: true }),
    CommonModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
