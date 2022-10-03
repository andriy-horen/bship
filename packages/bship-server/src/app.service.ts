import { Injectable } from '@nestjs/common';
import { IdGeneratorService } from './id-generator.service';

@Injectable()
export class AppService {
  /**
   *
   */
  constructor(private idGen: IdGeneratorService) {
    console.log(idGen.id);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
