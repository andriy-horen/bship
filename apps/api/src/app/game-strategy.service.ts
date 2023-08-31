import {
  contains,
  isEqual,
  Player,
  Rect,
  toPoints,
  UpdateStatus,
  upperBound,
} from '@bship/contracts';
import { Injectable } from '@nestjs/common';
import {
  GameEvent,
  GameEventString,
  GameResult,
  GameSnapshot,
  gameStateKey,
  GameUpdate,
} from './game-state';
import { nextPlayer } from './utils';

export const GAME_UPDATE_STRATEGY = 'GAME_UPDATE_STRATEGY';

export interface GameUpdateStrategy {
  canUpdate(event: GameEvent, snapshot: GameSnapshot): boolean;
  getNextUpdate(event: GameEvent, snapshot: GameSnapshot): GameUpdate;
}

@Injectable()
export class SeaBattleGameUpdateStrategy implements GameUpdateStrategy {
  // TODO: should come from the game config
  private readonly GRID_SIZE = 10;

  canUpdate(event: GameEvent, { state: updateHistory }: GameSnapshot): boolean {
    const isInsideBounds = upperBound(event.coord, this.GRID_SIZE);
    const isDuplicate = this.checkIfDuplicate(event, updateHistory);
    const outOfTurn = this.checkIfOutOfTurn(event, updateHistory);

    return isInsideBounds && !isDuplicate && !outOfTurn;
  }

  getNextUpdate(
    event: GameEvent,
    { state: updateHistory, fleet1, fleet2 }: GameSnapshot,
  ): GameUpdate {
    const { player, coord } = event;
    const targetFleet = player === Player.P1 ? fleet2 : fleet1;
    const targetShip = targetFleet.find((ship) => contains(coord, ship as Rect));
    // update: player missed
    if (!targetShip) {
      return {
        sourceEvent: event,
        nextTurn: nextPlayer(player),
        status: UpdateStatus.Miss,
      };
    }

    const isSunk = toPoints(targetShip as Rect)
      .filter((shipCoord) => !isEqual(coord, shipCoord))
      .every((shipCoord) => updateHistory.get(gameStateKey({ player, coord: shipCoord })));

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
      updateHistory,
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
    fleet: Readonly<Rect>[],
    state: ReadonlyMap<GameEventString, Readonly<GameUpdate>>,
  ): boolean {
    return fleet
      .flatMap((ship) => toPoints(ship as Rect))
      .every((coord) => state.has(gameStateKey({ player, coord })));
  }

  private tryGetGameResult(
    event: GameEvent,
    fleet: Readonly<Rect>[],
    state: ReadonlyMap<GameEventString, Readonly<GameUpdate>>,
  ): GameResult | undefined {
    return this.isFleetDestroyed(event, fleet, state) ? { winner: event.player } : undefined;
  }

  private checkIfDuplicate(
    event: GameEvent,
    state: ReadonlyMap<GameEventString, Readonly<GameUpdate>>,
  ): boolean {
    return state.has(gameStateKey(event));
  }

  private checkIfOutOfTurn(
    event: GameEvent,
    state: ReadonlyMap<GameEventString, Readonly<GameUpdate>>,
  ): boolean {
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
  canUpdate(event: GameEvent, snapshot: GameSnapshot): boolean {
    throw new Error('Method not implemented.');
  }
  getNextUpdate(event: GameEvent, snapshot: GameSnapshot): GameUpdate {
    throw new Error('Method not implemented.');
  }
}
