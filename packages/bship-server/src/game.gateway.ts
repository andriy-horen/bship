import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor() {
    console.log('ctr');
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: any): any {
    console.log(data);

    return data;
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(client);
  }

  handleDisconnect(client: any) {
    console.log(client);
  }
}
