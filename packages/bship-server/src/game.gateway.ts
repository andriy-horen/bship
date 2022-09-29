import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor() {
    console.log('ctr');
  }

  handleDisconnect(client: any) {
    console.log(client);
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(client);
  }
}
