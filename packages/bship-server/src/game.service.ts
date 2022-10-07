import { Injectable } from '@nestjs/common';
import { BattleshipCoord } from 'bship-contracts';
import { IdGeneratorService } from './id-generator.service';

export interface NewGameResult {
  gameReady: boolean;
  gameId?: string;
  connections?: [string, string];
}

export interface NewGameRequest {
  connectionId: string;
  fleet: BattleshipCoord[];
  timestamp: Date;
}

@Injectable()
export class GameService {
  private readonly newGameQueue: NewGameRequest[] = [];

  constructor(private idGenerator: IdGeneratorService) {}

  public requestNewGame(fleet: BattleshipCoord[], connectionId: string): NewGameResult {
    if (this.newGameQueue.length > 0) {
      const request = this.newGameQueue.shift()!;

      return {
        gameReady: true,
        gameId: this.idGenerator.generate(),
        connections: [request.connectionId, connectionId],
      };
    }

    this.newGameQueue.push({
      fleet,
      connectionId,
      timestamp: new Date(),
    });

    return { gameReady: false };
  }
}
