import { Button, Loader, MantineColor } from '@mantine/core';
import { noop } from 'lodash-es';
import { CurrentGameStatus } from '../game/gameSlice';

export interface PlayButtonProps {
  gameStatus: CurrentGameStatus;
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

  const buttonContent = gameStatus === CurrentGameStatus.WaitingForOpponent ? waiting : children;
  const clickHandler =
    gameStatus === CurrentGameStatus.WaitingForOpponent ? noop : onPlayButtonClick;

  return (
    <Button
      color={color}
      hidden={gameStatus === CurrentGameStatus.GameStarted}
      onClick={clickHandler}
    >
      {buttonContent}
    </Button>
  );
}
