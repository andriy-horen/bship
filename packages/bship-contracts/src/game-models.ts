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

export enum Players {
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
