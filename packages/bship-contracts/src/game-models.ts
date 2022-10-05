export interface Coordinates {
  x: number;
  y: number;
}

export type StringCoordinates = `${number},${number}`;

export type ShipCoordinates = [Coordinates, Coordinates];

export interface GameMessage {
  event: GameMessageType;
  data?: any;
}

export enum GameMessageType {
  Connect = "connect",
  CreateGame = "create_game",
  Move = "move",
  Acknowledge = "acknowledge",
}

export enum MoveStatus {
  Hit,
  Miss,
  Sunk,
}

export enum GameResponseType {
  Connected = "connected",
  GameStarted = "game_started",
  Mark = "mark",
  GameAborted = "game_aborted",
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
  orientation: "v" | "h";
  position: [number, number];
}

export const GRID_LOWER_BOUND = 0;
export const GRID_UPPER_BOUND = 9;
