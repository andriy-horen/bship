import { Rect } from '@bship/contracts';
import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { GameContext } from './game-context';
import { GameStateFactory } from './game-state-factory.service';
import { GameWebSocket } from './game.gateway';

export interface ClientPairingRequest {
  connectionId: string;
  socket: GameWebSocket;
  fleet: Rect[];
}

export interface MatchGameResult {
  gameReady: boolean;
  gameId?: string;
}

@Injectable()
export class ClientPairingService {
  private readonly gameRequestQueue: ClientPairingRequest[] = [];

  constructor(
    private _gameStateFactory: GameStateFactory,
    @Inject(Logger) private readonly logger: LoggerService
  ) {}

  tryPairClient(request: ClientPairingRequest): GameContext | null {
    if (this.gameRequestQueue.length > 0) {
      /**
       * Check case when client tries to pair with itself
       */
      if (this.gameRequestQueue[0].socket === request.socket) {
        this.logger.error('Client tries to pair game with itself', ClientPairingService.name);
        return null;
      }

      const waiting = this.gameRequestQueue.shift()!;

      return new GameContext(waiting, request, this._gameStateFactory);
    }

    this.gameRequestQueue.push(request);

    return null;
  }
}
