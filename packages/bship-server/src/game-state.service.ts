import { Injectable, Scope } from '@nestjs/common';
import { MoveStatus, Player, Point, Rect } from 'bship-contracts';
import { ReplaySubject } from 'rxjs';

export interface GameResult {
  winner: Player;
}

export enum GameUpdateType {
  MoveUpdate,
  GameCompleted,
}

export interface GameEvent {
  player: Player;
  coord: Point;
}

export interface GameUpdate {
  event: GameEvent;
  type: GameUpdateType;
}

export interface GameMoveUpdate extends GameUpdate {
  type: GameUpdateType.MoveUpdate;
  nextTurn: Player;
  status: MoveStatus;
  sunkShip?: Rect;
}

export interface GameCompletedUpdate extends GameUpdate {
  winner: Player;
}

@Injectable({ scope: Scope.TRANSIENT })
export class GameStateService {
  private readonly _gameUpdateSubject = new ReplaySubject<GameUpdate>();

  readonly state$ = this._gameUpdateSubject.asObservable();

  update(): boolean {
    return true;
  }
}
