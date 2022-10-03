import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { customAlphabet } from 'nanoid';

@Injectable()
export class IdGeneratorService {
  private readonly nanoid: (size?: number) => string;

  constructor(config: ConfigService) {
    const alphabet = config.get<string>('idGeneration.alphabet');
    const size = config.get<number>('idGeneration.size');

    this.nanoid = customAlphabet(alphabet, size);
  }

  get id(): string {
    return this.nanoid();
  }
}
