import { IconShip } from '@tabler/icons';
import { CurrentGameStatus } from '../game/gameSlice';
import { PlayButton } from './PlayButton';

export interface PlayButtonsContainerProps {
  gameStatus: CurrentGameStatus;
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
        <IconShip style={{ ...iconStyle, transform: 'scaleX(-1)' }} size={18}></IconShip>
        Play online
      </PlayButton>
      {/* <PlayButton color="dark" onPlayButtonClick={onPlayComputerClick} gameStatus={gameStatus}>
        <IconDeviceDesktop style={iconStyle} size={18}></IconDeviceDesktop>
        Play computer
      </PlayButton> */}
    </>
  );
}
