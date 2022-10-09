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
  Connect = 'connect',
  CreateGame = 'create_game',
  Move = 'move',
  Acknowledge = 'ack',
}

export enum MoveStatus {
  Hit = 'hit',
  Miss = 'miss',
  Sunk = 'sunk',
}

export enum GameResponseType {
  Connected = 'connected',
  GameStarted = 'game_started',
  WaitForOpponent = 'wait_for_opponent',
  Mark = 'mark',
  GameAborted = 'game_aborted',
}

export enum Player {
  Player0 = 0,
  Player1 = 1,
}

export interface MarkPayload {
  position: { y: number; x: number };
  grid: Player;
  status: MoveStatus;
  next: Player;
}

export interface Battleship {
  size: number;
  orientation: Orientation;
  coordinates: Coordinates;
  hitSections?: number[];
}

export const GRID_LOWER_BOUND = 0;
export const GRID_UPPER_BOUND = 9;
