import { Module } from '@nestjs/common';
import { CommonModule } from './common.module';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [CommonModule],
  providers: [GameGateway, GameService],
})
export class GameModule {}
