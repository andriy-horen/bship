import { Injectable } from '@nestjs/common';
import { Battleship } from 'bship-contracts';
import { IdGeneratorService } from './id-generator.service';

export interface CreateGameResult {
  gameId: string;
}

@Injectable()
export class GameService {
  constructor(private idGenerator: IdGeneratorService) {}

  public createGame(fleet: Battleship[]): CreateGameResult {
    console.log(fleet);

    return { gameId: this.idGenerator.id };
  }
}
