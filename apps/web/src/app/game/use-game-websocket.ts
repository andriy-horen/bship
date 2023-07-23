import { GameMessage, GameMessageType } from '@bship/contracts';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import useWebSocket from 'react-use-websocket';

export interface WebsocketGameEvents {
  onGameUpdate: (payload: GameMessage) => void;
  onWaitForOpponent: (payload: GameMessage) => void;
  onGameStarted: (payload: GameMessage) => void;
  onGameAborted: (payload: GameMessage) => void;
}

export const useGameWebsocket = (
  { onGameStarted, onGameAborted, onGameUpdate, onWaitForOpponent }: WebsocketGameEvents,
  onClose?: (event: CloseEvent) => void,
) => {
  const [websocketUrl] = useState(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`,
  );

  const [websocketId, setWebsocketId] = useState(nanoid(21));
  const [connect, setConnect] = useState(false);

  const resetConnection = () => {
    setConnect(false);
    setWebsocketId(nanoid(21));
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
            onGameUpdate(data);
            break;
          case GameMessageType.WaitForOpponent:
            onWaitForOpponent(data);
            break;
          case GameMessageType.GameStarted:
            onGameStarted(data);
            break;
          case GameMessageType.GameAborted:
            onGameAborted(data);
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
    connect,
  );

  return { sendJsonMessage, sendMessage, resetConnection };
};
