import { Module } from '@nestjs/common';
import { ClientPairingService } from './client-pairing.service';
import { CommonModule } from './common.module';
import { GameStoreService } from './game-store.service';
import { GameGateway } from './game.gateway';

@Module({
  imports: [CommonModule],
  providers: [GameGateway, GameStoreService, ClientPairingService],
})
export class GameModule {}
