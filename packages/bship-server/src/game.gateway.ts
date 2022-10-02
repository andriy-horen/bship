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

@WebSocketGateway({
  path: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private gameSerive: GameService) {}

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: any): any {
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
