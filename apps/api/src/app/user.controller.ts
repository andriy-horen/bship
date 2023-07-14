import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get()
  initUser(): { userId: string; geolocation: string } {
    return {
      userId: '1337',
      geolocation: 'AT',
    };
  }
}
