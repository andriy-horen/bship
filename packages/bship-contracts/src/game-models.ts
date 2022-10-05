export interface Coordinates {
  x: number;
  y: number;
}

export type StringCoordinates = `${number},${number}`;

export type ShipCoordinates = [Coordinates, Coordinates];

export interface GameEvent {
  command: GameCommand;
  payload?: any;
}

export enum GameCommand {
  CreateGame = "create_game",
  Attack = "attack",
  Acknowledge = "acknowledge",
}

export enum AttackStatus {
  Hit,
  Miss,
  Sunk,
}

export enum ServerCommand {
  GameStarted,
  Mark,
  GameAborted,
}

export enum Player {
  Player0 = 0,
  Player1 = 1,
}

export interface MarkPayload {
  position: { y: number; x: number };
  grid: Player;
  status: AttackStatus;
  next: Player;
}

export interface Battleship {
  size: number;
  orientation: "v" | "h";
  position: [number, number];
}

export const GRID_LOWER_BOUND = 0;
export const GRID_UPPER_BOUND = 9;
