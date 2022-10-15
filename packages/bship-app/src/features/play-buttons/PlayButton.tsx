import { Button, Loader, MantineColor } from '@mantine/core';

export type PlayButtonState = 'none' | 'waiting' | 'started';

export interface PlayButtonProps {
  state: PlayButtonState;
  color: MantineColor;
  onPlayButtonClick: () => void;
  children: React.ReactNode;
}

export function PlayButton({ onPlayButtonClick, state, color, children }: PlayButtonProps) {
  const waiting = (
    <>
      Waiting for opponent <Loader color="white" size="xs" />
    </>
  );

  const buttonContent = state === 'waiting' ? waiting : children;

  return (
    <Button color={color} hidden={state === 'started'} onClick={onPlayButtonClick}>
      {buttonContent}
    </Button>
  );
}
