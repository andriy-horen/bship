import { Injectable } from '@nestjs/common';
import {
  contains,
  isEqual,
  Player,
  Rect,
  toPoints,
  UpdateStatus,
  upperBound,
} from 'bship-contracts';
import { GameEvent, GameEventString, GameResult, gameStateKey, GameUpdate } from './game-state';
import { nextPlayer } from './utils';

export const GAME_UPDATE_STRATEGY = 'GAME_UPDATE_STRATEGY';

export interface GameUpdateContext {
  event: GameEvent;
  state: Map<GameEventString, GameUpdate>;
  fleet1: Rect[];
  fleet2: Rect[];
}

export interface GameUpdateStrategy {
  canUpdate(context: GameUpdateContext): boolean;
  getNextUpdate(context: GameUpdateContext): GameUpdate;
}

@Injectable()
export class SeaBattleGameUpdateStrategy implements GameUpdateStrategy {
  // TODO: should come from game config
  private readonly GRID_SIZE = 10;

  canUpdate({ event, state }: GameUpdateContext): boolean {
    const isInsideBounds = upperBound(event.coord, this.GRID_SIZE);
    const isDuplicate = this.checkIfDuplicate(event, state);
    const outOfTurn = this.checkIfOutOfTurn(event, state);

    return isInsideBounds && !isDuplicate && !outOfTurn;
  }

  getNextUpdate({ event, state, fleet1, fleet2 }: GameUpdateContext): GameUpdate {
    const { player, coord } = event;
    const targetFleet = player === Player.P1 ? fleet2 : fleet1;
    const targetShip = targetFleet.find((ship) => contains(coord, ship));
    // update: player missed
    if (!targetShip) {
      return {
        sourceEvent: event,
        nextTurn: nextPlayer(player),
        status: UpdateStatus.Miss,
      };
    }

    const isSunk = toPoints(targetShip)
      .filter((shipCoord) => !isEqual(coord, shipCoord))
      .every((shipCoord) => state.get(gameStateKey({ player, coord: shipCoord })));

    // update: player hit
    if (!isSunk) {
      return {
        sourceEvent: event,
        nextTurn: player,
        status: UpdateStatus.Hit,
      };
    }

    // should only calculate game result when hit & sunk (potentially last ship)
    const gameResult = this.tryGetGameResult(
      event,
      // filters out last sunk ship because it's already checked
      targetFleet.filter((ship) => ship !== targetShip),
      state,
    );

    // update: player hit & sunk a ship
    return {
      sourceEvent: event,
      nextTurn: player,
      status: UpdateStatus.Hit,
      sunkShip: targetShip,
      gameResult,
    };
  }

  private isFleetDestroyed(
    { player }: GameEvent,
    fleet: Rect[],
    state: Map<GameEventString, GameUpdate>,
  ): boolean {
    return fleet
      .flatMap((ship) => toPoints(ship))
      .every((coord) => state.has(gameStateKey({ player, coord })));
  }

  private tryGetGameResult(
    event: GameEvent,
    fleet: Rect[],
    state: Map<GameEventString, GameUpdate>,
  ): GameResult | undefined {
    return this.isFleetDestroyed(event, fleet, state) ? { winner: event.player } : undefined;
  }

  private checkIfDuplicate(event: GameEvent, state: Map<GameEventString, GameUpdate>): boolean {
    return state.has(gameStateKey(event));
  }

  private checkIfOutOfTurn(event: GameEvent, state: Map<GameEventString, GameUpdate>): boolean {
    if (state.size === 0) {
      // TODO: first player to move should be configurable
      return event.player !== Player.P1;
    }

    const lastUpdate = [...state.values()][state.size - 1];
    return event.player !== lastUpdate.nextTurn;
  }
}

@Injectable()
export class HasbroGameUpdateStrategy implements GameUpdateStrategy {
  canUpdate(context: GameUpdateContext): boolean {
    throw new Error('Method not implemented.');
  }
  getNextUpdate(context: GameUpdateContext): GameUpdate {
    throw new Error('Method not implemented.');
  }
}
