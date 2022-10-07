import { Injectable } from '@nestjs/common';
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

  constructor(private gameStore: GameStoreService) {}

  tryPairClient(request: ClientPairingRequest): GameContext | null {
    if (this.gameRequestQueue.length > 0) {
      const waiting = this.gameRequestQueue.shift()!;

      return new GameContext(waiting, request, this.gameStore);
    }

    this.gameRequestQueue.push(request);

    return null;
  }
}
