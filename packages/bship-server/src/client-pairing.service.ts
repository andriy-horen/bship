import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { BattleshipCoord } from 'bship-contracts';
import { WebSocket } from 'ws';
import { GameContext } from './game-context';
import { GameStoreService } from './game-store.service';

export interface ClientPairingRequest {
  connectionId: string;
  socket: WebSocket;
  fleet: BattleshipCoord[];
}

export interface MatchGameResult {
  gameReady: boolean;
  gameId?: string;
}

@Injectable()
export class ClientPairingService {
  private readonly gameRequestQueue: ClientPairingRequest[] = [];

  constructor(
    private gameStore: GameStoreService,
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

      return new GameContext(waiting, request, this.gameStore);
    }

    this.gameRequestQueue.push(request);

    return null;
  }
}
