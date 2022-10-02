import { Injectable } from '@nestjs/common';

enum GameCommand {
  CreateGame = 'create_game',
  Attack = 'attack',
  Acknowledge = 'acknowledge',
}

export enum AttackStatus {
  Hit,
  Miss,
  Sunk,
}

enum ServerCommand {
  GameStarted,
  Mark,
  GameAborted,
}

enum Players {
  Player,
  Opponent,
}

export interface MarkPayload {
  position: { y: number; x: number };
  grid: Players;
  status: AttackStatus;
  next: Players;
}

export interface Message {
  command: GameCommand;
  payload?: any;
}

@Injectable()
export class GameService {}
