import { Battleship } from '@bship/contracts';
import { noop } from 'lodash-es';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { CustomDragLayer } from '../../dnd/CustomDragLayer';
import { FleetGrid } from '../fleet-grid/FleetGrid';
import { GridLabels } from '../grid-labels/GridLabels';
import { GridLayer, GridSquare } from '../grid-layer/GridLayer';
import { PlayGrid } from '../play-grid/PlayGrid';
import styles from './EditGrid.module.css';

export interface EditGridProps {
  fleet: Battleship[];
  grid: GridSquare[][];
  readonly?: boolean;
}

export const EditGrid: React.FunctionComponent<EditGridProps> = ({
  fleet,
  grid,
  readonly = false,
}) => {
  if (readonly) {
    return (
      <div className={styles.playerGrid}>
        <PlayGrid fleet={fleet} grid={grid} onSquareClick={noop} />
      </div>
    );
  }

  return (
    <div className={styles.playerGrid}>
      <GridLabels>
        <div className={styles.fleetGrid}>
          <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
            <FleetGrid fleet={fleet} />
            <CustomDragLayer />
          </DndProvider>
        </div>
        <GridLayer grid={grid} />
      </GridLabels>
    </div>
  );
};
