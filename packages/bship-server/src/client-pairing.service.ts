import { Injectable } from '@nestjs/common';
import { BattleshipCoord, GameResponseType } from 'bship-contracts';
import { RawData, WebSocket } from 'ws';
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

export class GameContext {
  private readonly _player1: WebSocket;
  private readonly _player2: WebSocket;

  private readonly _gameId: string;

  constructor(
    player1: ClientPairingRequest,
    player2: ClientPairingRequest,
    private _gameStore: GameStoreService
  ) {
    this._player1 = player1.socket;
    this._player2 = player2.socket;

    this._gameId = this._gameStore.addGame({
      fleet1: player1.fleet,
      fleet2: player2.fleet,
    });

    this.notifyClients(GameResponseType.GameStarted, { gameId: this._gameId });
    this.subscribe();
  }

  notifyClients(event: GameResponseType, data?: any): void {
    this._player1.send(JSON.stringify({ event, data }));
    this._player2.send(JSON.stringify({ event, data }));
  }

  subscribe(): void {
    this._player1.on('message', this.messageHandlerFactory(this._player1));
    this._player2.on('message', this.messageHandlerFactory(this._player2));
  }

  private messageHandlerFactory = (client: WebSocket) => {
    return (message: RawData) => {
      const updateResult = this._gameStore.updateGame(this._gameId);

      this.notifyClients(JSON.parse(message.toString()));
      this.notifyClients(GameResponseType.Mark, updateResult);
    };
  };
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
