export interface Coordinates {
  x: number;
  y: number;
}

export type StringCoordinates = `${number},${number}`;

export type BattleshipCoord = [Coordinates, Coordinates];

export type Orientation = 'v' | 'h';

export interface GameMessage {
  event: GameMessageType;
  data?: any;
}

export enum GameMessageType {
  CreateGame = 'create_game',
  Move = 'move',
  Acknowledge = 'ack',
}

export enum MoveStatus {
  Hit = 'hit',
  Miss = 'miss',
}

export enum GameResponseType {
  GameStarted = 'game_started',
  WaitForOpponent = 'wait_for_opponent',
  Mark = 'mark',
  GameCompleted = 'game_completed',
  GameAborted = 'game_aborted',
}

export enum Player {
  P1 = 0,
  P2 = 1,
}

export interface MarkPayload {
  coordinates: Coordinates;
  value: MoveStatus;
  target?: BattleshipCoord;
  next: boolean;
  self: boolean;
}

export interface Battleship {
  size: number;
  orientation: Orientation;
  coordinates: Coordinates;
  hitSections?: number[];
}

export const GRID_LOWER_BOUND = 0;
export const GRID_UPPER_BOUND = 9;
