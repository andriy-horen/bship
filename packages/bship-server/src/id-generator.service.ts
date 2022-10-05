import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { customAlphabet, urlAlphabet } from 'nanoid';

@Injectable()
export class IdGeneratorService {
  private readonly nanoid: (size?: number) => string;

  constructor(config: ConfigService) {
    const alphabet = config.get<string>('idGenerator.alphabet') ?? urlAlphabet;
    const size = config.get<number>('idGenerator.size');

    this.nanoid = customAlphabet(alphabet, size);
  }

  get id(): string {
    return this.nanoid();
  }
}
