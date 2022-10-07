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
import { ClientPairingService, GameContext } from './client-pairing.service';
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

  private readonly games: GameContext[] = [];

  constructor(
    private clientPairingService: ClientPairingService,
    private idGenerator: IdGeneratorService
  ) {}

  @SubscribeMessage(GameMessageType.Connect)
  handleConnect(@ConnectedSocket() client: GameWebSocket) {
    const connectionId = this.idGenerator.generate();
    client.connectionId = connectionId;
    this.clients.set(connectionId, client);

    return { event: GameResponseType.Connected };
  }

  @SubscribeMessage(GameMessageType.CreateGame)
  handleCreateGame(@MessageBody() data: any, @ConnectedSocket() client: GameWebSocket): any {
    if (!client.connectionId) {
      return;
    }

    const gameContext = this.clientPairingService.tryPairClient({
      connectionId: client.connectionId,
      socket: client,
      fleet: data.fleet,
    });

    if (!gameContext) {
      return { event: GameResponseType.WaitForOpponent };
    }

    this.games.push(gameContext);
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

  handleDisconnect(client: GameWebSocket): void {
    if (client.connectionId) {
      this.clients.delete(client.connectionId);
    }
  }
}
