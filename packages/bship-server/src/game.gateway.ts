import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameMessageType, GameResponseType } from 'bship-contracts';
import { IncomingMessage } from 'node:http';
import { Server, WebSocket } from 'ws';
import { GameService } from './game.service';
import { IdGeneratorService } from './id-generator.service';

interface GameWebSocket extends WebSocket {
  connectionId: string | undefined;
}

@WebSocketGateway({
  path: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private readonly clients = new Map<string, GameWebSocket>();

  constructor(
    private gameSerive: GameService,
    private idGenerator: IdGeneratorService,
  ) {
    setInterval(() => {
      console.log([...this.clients.keys()]);
    }, 1000);
  }

  @SubscribeMessage(GameMessageType.Connect)
  handleConnect(@ConnectedSocket() client: GameWebSocket) {
    const connectionId = this.idGenerator.generate();
    client.connectionId = connectionId;
    this.clients.set(connectionId, client);

    return { event: GameResponseType.Connected };
  }

  @SubscribeMessage(GameMessageType.CreateGame)
  handleCreateGame(
    @MessageBody() data: any,
    @ConnectedSocket() { connectionId }: GameWebSocket,
  ): any {
    if (!connectionId) {
      return;
    }

    return this.gameSerive.createGame(data.fleet, connectionId);
  }

  @SubscribeMessage(GameMessageType.Move)
  handleMove(
    @MessageBody() data: any,
    @ConnectedSocket() { connectionId }: GameWebSocket,
  ): any {
    if (!connectionId) {
      return;
    }

    // return this.gameSerive.createGame(data.fleet, connectionId);
  }

  @SubscribeMessage('chat')
  handleChatEvent(@MessageBody() data: any): any {
    console.log(data);

    return data;
  }

  handleConnection(client: GameWebSocket, req: IncomingMessage): any {
    // TODO: implement re-connect logic when connection was lost
    // const { query } = url.parse(req.url ?? '', true);
  }

  handleDisconnect(client: GameWebSocket) {
    if (client.connectionId) {
      this.clients.delete(client.connectionId);
    }
  }
}
