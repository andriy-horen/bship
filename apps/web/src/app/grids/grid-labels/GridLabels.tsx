import { range } from 'lodash-es';
import { PropsWithChildren } from 'react';
import styles from './GridLabels.module.css';

export type GridLabelsProps = PropsWithChildren<Record<never, never>>;

export const GridLabels: React.FunctionComponent<GridLabelsProps> = ({ children }) => {
  return (
    <>
      <div className={styles.vertical}>
        {Array.from('ABCDEFGHIJ').map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      {children}
      <div className={styles.horizontal}>
        {range(1, 11).map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
    </>
  );
};
