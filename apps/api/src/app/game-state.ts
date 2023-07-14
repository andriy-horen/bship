import { Player, Point, Rect, UpdateStatus } from '@bship/contracts';
import { ReplaySubject, takeWhile } from 'rxjs';
import { GameUpdateStrategy } from './game-strategy.service';

export interface GameResult {
  winner: Player;
}

export interface GameEvent {
  player: Player;
  coord: Point;
}

export interface GameUpdate {
  sourceEvent: GameEvent;
  nextTurn: Player;
  status: UpdateStatus;
  gameResult?: GameResult;
  sunkShip?: Rect;
}

export class GameState {
  private readonly _state = new Map<GameEventString, GameUpdate>();
  private readonly _gameUpdateSubject = new ReplaySubject<GameUpdate>();

  private _gameResult: GameResult | null = null;

  constructor(
    private readonly _gameUpdateStrategy: GameUpdateStrategy,
    private readonly _fleet1: Rect[],
    private readonly _fleet2: Rect[]
  ) {}

  readonly stateUpdate = this._gameUpdateSubject.pipe(
    takeWhile((update) => !update.gameResult, true)
  );

  update(event: GameEvent): boolean {
    if (this.isGameCompleted) {
      return false;
    }

    const context = {
      event,
      state: this._state,
      fleet1: this._fleet1,
      fleet2: this._fleet2,
    };

    if (!this._gameUpdateStrategy.canUpdate(context)) {
      return false;
    }

    const update = this._gameUpdateStrategy.getNextUpdate(context);

    this._state.set(gameStateKey(event), update);
    this._gameUpdateSubject.next(update);

    return true;
  }

  get isGameCompleted(): boolean {
    return !!this._gameResult;
  }
}

export type GameEventString = `p${number}:${number},${number}`;

export function gameStateKey({ player, coord }: GameEvent): GameEventString {
  return `p${player}:${coord.y},${coord.x}`;
}
