import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameCommand, GameEvent } from 'bship-contracts';
import { IncomingMessage } from 'node:http';
import url from 'node:url';
import { Server, WebSocket } from 'ws';
import { GameService } from './game.service';

@WebSocketGateway({
  path: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

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

  handleConnection(client: WebSocket, req: IncomingMessage) {
    const { query } = url.parse(req.url ?? '', true);

    console.log(query?.id);
  }

  handleDisconnect(client: WebSocket) {
    //console.log(client);
  }
}
