import { Logger, Module } from '@nestjs/common';
import { ClientPairingService } from './client-pairing.service';
import { CommonModule } from './common.module';
import { GameStateFactory } from './game-state-factory.service';
import { GAME_UPDATE_STRATEGY, SeaBattleGameUpdateStrategy } from './game-strategy.service';
import { GameGateway } from './game.gateway';

@Module({
  imports: [CommonModule],
  providers: [
    GameGateway,
    ClientPairingService,
    {
      provide: GAME_UPDATE_STRATEGY,
      useClass: SeaBattleGameUpdateStrategy,
    },
    GameStateFactory,
    Logger,
  ],
})
export class GameModule {}
