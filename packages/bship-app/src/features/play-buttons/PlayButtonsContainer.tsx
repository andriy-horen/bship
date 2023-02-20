import { GameStatus } from '../game/gameEventSlice';
import { PlayButton } from './PlayButton';

export interface PlayButtonsContainerProps {
  gameStatus: GameStatus;
  onPlayOnlineClick: () => void;
  onPlayComputerClick: () => void;
}

export function PlayButtonsContainer({
  gameStatus,
  onPlayOnlineClick,
  onPlayComputerClick,
}: PlayButtonsContainerProps) {
  const iconStyle: React.CSSProperties = {
    marginRight: '8px',
  };

  return (
    <>
      <PlayButton color="green" onPlayButtonClick={onPlayOnlineClick} gameStatus={gameStatus}>
        Play online
      </PlayButton>
      {/* <PlayButton color="dark" onPlayButtonClick={onPlayComputerClick} gameStatus={gameStatus}>
        <IconDeviceDesktop style={iconStyle} size={18}></IconDeviceDesktop>
        Play computer
      </PlayButton> */}
    </>
  );
}
