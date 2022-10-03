import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

@Injectable()
export class IdGeneratorService {
  private readonly nanoid: (size?: number) => string;

  constructor() {
    console.log('id-gen init');

    const alphabet =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    this.nanoid = customAlphabet(alphabet, 20);
  }

  get id(): string {
    return this.nanoid();
  }
}
