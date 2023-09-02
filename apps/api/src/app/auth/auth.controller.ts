import { Body, Controller, Get, HttpCode, HttpStatus, Post, Session } from '@nestjs/common';
import { IsAlphanumeric, IsNotEmpty, Length } from 'class-validator';

export class SignInRequest {
  // TODO: implement username validation based on requirements
  @IsNotEmpty()
  @Length(2, 20)
  @IsAlphanumeric()
  username = '';
}

@Controller('auth')
export class AuthController {
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInRequest: SignInRequest, @Session() session: Record<string, string>) {
    session.username = signInRequest.username;

    return { success: true };
  }

  @Get('echo')
  echo() {
    return 'ping';
  }
}
