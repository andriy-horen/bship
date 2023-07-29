import { Point, Rect } from './point';

export type StringCoordinates = `${number},${number}`;

export type Orientation = 'v' | 'h';

export const PING = '0';
export const PONG = '1';

export interface GameMessage {
  event: GameMessageType;
  data?: any;
  seq?: number;
}

export function isGameMessage(message: any): message is GameMessage {
  return typeof message?.event === 'string';
}

export enum GameMessageType {
  CreateGame = 'create',
  GameStarted = 'started',
  WaitForOpponent = 'wait',
  GameEvent = 'event',
  GameUpdate = 'update',
  GameCompleted = 'completed',
  GameAborted = 'aborted',
  Acknowledge = 'ack',
}

export enum UpdateStatus {
  Hit = 'hit',
  Miss = 'miss',
}

export enum Player {
  P1 = 0,
  P2 = 1,
}

export interface GameUpdatePayload {
  coord: Point;
  status: UpdateStatus;
  next: boolean;
  self: boolean;
  won?: boolean;
  sunk?: Rect;
  grids: [GridEntry[], GridEntry[]];
}

export interface GridEntry {
  coord: Point | Rect;
  type: GridEntryType;
}

export enum GridEntryType {
  HitSquare = 'hit',
  MissSquare = 'miss',
  SunkenShip = 'sunk',
}

export interface Battleship {
  size: number;
  orientation: Orientation;
  coordinates: Point;
  hitSections?: number[];
}

export const GRID_LOWER_BOUND = 0;
export const GRID_UPPER_BOUND = 9;
