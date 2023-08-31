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
  sunkShip?: Readonly<Rect>;
}

export interface GameSnapshot {
  state: ReadonlyMap<GameEventString, Readonly<GameUpdate>>;
  fleet1: ReadonlyArray<Rect>;
  fleet2: ReadonlyArray<Rect>;
}

export class GameState {
  private readonly _state = new Map<GameEventString, Readonly<GameUpdate>>();
  private readonly _gameUpdateSubject = new ReplaySubject<Readonly<GameUpdate>>();
  private readonly _fleet1: ReadonlyArray<Rect>;
  private readonly _fleet2: ReadonlyArray<Rect>;

  private _gameResult: GameResult | null = null;

  constructor(
    private readonly _gameUpdateStrategy: GameUpdateStrategy,
    fleet1: Rect[],
    fleet2: Rect[],
  ) {
    this._fleet1 = fleet1.map((s) => Object.freeze(s) as Rect);
    this._fleet2 = fleet2.map((s) => Object.freeze(s) as Rect);
  }

  readonly stateUpdate = this._gameUpdateSubject.pipe(
    takeWhile((update) => !update.gameResult, true),
  );

  get snapshot(): GameSnapshot {
    return {
      state: new Map(this._state),
      fleet1: [...this._fleet1],
      fleet2: [...this._fleet2],
    };
  }

  update(event: GameEvent): boolean {
    if (this.isGameCompleted) {
      return false;
    }

    if (!this._gameUpdateStrategy.canUpdate(event, this.snapshot)) {
      return false;
    }

    const update = Object.freeze(this._gameUpdateStrategy.getNextUpdate(event, this.snapshot));

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
