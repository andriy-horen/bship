import { Battleship, GameMessage, GameMessageType, PING } from '@bship/contracts';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { SendJsonMessage, SendMessage } from 'react-use-websocket/dist/lib/types';
import { toRect } from '../utils';

export interface WebsocketGameEvents {
  onGameUpdate: (payload: GameMessage) => void;
  onWaitForOpponent: (payload: GameMessage) => void;
  onGameStarted: (payload: GameMessage) => void;
  onGameAborted: (payload: GameMessage) => void;
}

export interface GameWebsocket {
  sendJsonMessage: SendJsonMessage;
  sendMessage: SendMessage;
  resetConnection: () => void;
  createGame: (playerFleet: Battleship[]) => void;
}

export const useGameWebsocket = (
  { onGameStarted, onGameAborted, onGameUpdate, onWaitForOpponent }: WebsocketGameEvents,
  onClose?: (event: CloseEvent) => void,
): GameWebsocket => {
  const [websocketUrl] = useState(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`,
  );

  const [websocketId, setWebsocketId] = useState(nanoid(21));
  const [connected, setConnected] = useState(false);

  const resetConnection = () => {
    setConnected(false);
    setWebsocketId(nanoid(21));
  };

  const createGame = (playerFleet: Battleship[]) => {
    setConnected(true);
    sendJsonMessage({
      event: GameMessageType.CreateGame,
      data: {
        fleet: playerFleet.map((ship) => toRect(ship)),
      },
    } as any);
  };

  const { sendJsonMessage, sendMessage } = useWebSocket(
    websocketUrl,
    {
      queryParams: { id: websocketId },
      share: true,
      onMessage({ data }) {
        if (!data) return;

        const message = JSON.parse(data) as GameMessage;
        switch (message.event) {
          case GameMessageType.GameUpdate:
            onGameUpdate(message);
            break;
          case GameMessageType.WaitForOpponent:
            onWaitForOpponent(message);
            break;
          case GameMessageType.GameStarted:
            onGameStarted(message);
            break;
          case GameMessageType.GameAborted:
            onGameAborted(message);
            break;
        }

        if (typeof message.seq === 'number') {
          sendJsonMessage({
            event: GameMessageType.Acknowledge,
            seq: message.seq,
          });
        }
      },
      onClose(event) {
        onClose?.(event);
      },
    },
    connected,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!connected) {
        return;
      }
      sendMessage(PING, false);
    }, 5_000);
    return () => clearInterval(interval);
  }, [connected, sendMessage]);

  return { sendJsonMessage, sendMessage, resetConnection, createGame };
};
