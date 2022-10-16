import { Button, Loader, MantineColor } from '@mantine/core';
import { noop } from 'lodash-es';
import { GameStatus } from '../game/gameEventSlice';

export interface PlayButtonProps {
  gameStatus: GameStatus;
  color: MantineColor;
  onPlayButtonClick: () => void;
  children: React.ReactNode;
}

export function PlayButton({ onPlayButtonClick, gameStatus, color, children }: PlayButtonProps) {
  const waiting = (
    <>
      <Loader color="white" size="xs" style={{ marginRight: '8px' }} /> Waiting for opponent
    </>
  );

  const buttonContent = gameStatus === GameStatus.WaitingForOpponent ? waiting : children;
  const clickHandler = gameStatus === GameStatus.WaitingForOpponent ? noop : onPlayButtonClick;

  return (
    <Button color={color} hidden={gameStatus === GameStatus.GameStarted} onClick={clickHandler}>
      {buttonContent}
    </Button>
  );
}
