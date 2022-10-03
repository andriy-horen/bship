import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common.module';
import { GameModule } from './game.module';

@Module({
  imports: [CommonModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
