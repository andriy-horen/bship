import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { GameService } from './game.service';
import { GameCommand, GameEvent } from 'bship-contracts';

@WebSocketGateway({
  path: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private gameSerive: GameService) {}

  @SubscribeMessage('game')
  handleGameEvent(@MessageBody() data: GameEvent): any {
    if (!data) {
      return;
    }

    switch (data.command) {
      case GameCommand.CreateGame:
        return this.gameSerive.createGame(data.payload.fleet);
    }

    return data;
  }

  @SubscribeMessage('chat')
  handleChatEvent(@MessageBody() data: any): any {
    console.log(data);

    return data;
  }

  handleConnection(client: any, req: any) {
    console.log(req);
  }

  handleDisconnect(client: any) {
    //console.log(client);
  }
}
