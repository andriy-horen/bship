import { Battleship } from '@bship/contracts';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { CustomDragLayer } from '../../dnd/CustomDragLayer';
import { FleetGrid } from '../fleet-grid/FleetGrid';
import { GridLabels } from '../grid-labels/GridLabels';
import { GridLayer, GridSquare } from '../grid-layer/GridLayer';
import styles from './EditGrid.module.css';

export interface EditGridProps {
  fleet: Battleship[];
  grid: GridSquare[][];
}

export const EditGrid: React.FunctionComponent<EditGridProps> = ({ fleet, grid }) => {
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
