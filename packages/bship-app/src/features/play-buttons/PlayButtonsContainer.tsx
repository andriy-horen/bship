import { showNotification } from '@mantine/notifications';
import { IconDeviceDesktop, IconShip } from '@tabler/icons';
import { useAppSelector } from '../../app/hooks';
import { CurrentGame, selectCurrentGame } from '../game/gameSlice';
import { PlayButton, PlayButtonState } from './PlayButton';

export function PlayButtonsContainer() {
  const currentGame = useAppSelector(selectCurrentGame);

  const playButtonClick = () => {
    showNotification({
      title: 'Game started',
      message: 'You go first. Good luck!',
      color: 'green',
    });
  };

  const getButtonState = (game: CurrentGame): PlayButtonState => {
    return 'none';
  };

  const iconStyle: React.CSSProperties = {
    marginRight: '8px',
  };

  return (
    <>
      <PlayButton
        color="green"
        onPlayButtonClick={playButtonClick}
        state={getButtonState(currentGame)}
      >
        <IconShip style={{ ...iconStyle, transform: 'scaleX(-1)' }} size={18}></IconShip>
        Play online
      </PlayButton>
      <PlayButton
        color="dark"
        onPlayButtonClick={playButtonClick}
        state={getButtonState(currentGame)}
      >
        <IconDeviceDesktop style={iconStyle} size={18}></IconDeviceDesktop>
        Play computer
      </PlayButton>
    </>
  );
}
