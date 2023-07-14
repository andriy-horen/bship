import { Rect } from '@bship/contracts';
import { Inject, Injectable } from '@nestjs/common';
import { GameState } from './game-state';
import { GAME_UPDATE_STRATEGY, GameUpdateStrategy } from './game-strategy.service';

Injectable();
export class GameStateFactory {
  constructor(@Inject(GAME_UPDATE_STRATEGY) private gameUpdateStrategy: GameUpdateStrategy) {}

  createGameState(fleet1: Rect[], fleet2: Rect[]): GameState {
    return new GameState(this.gameUpdateStrategy, fleet1, fleet2);
  }
}
