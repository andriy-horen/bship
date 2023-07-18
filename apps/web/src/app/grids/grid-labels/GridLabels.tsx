import { range } from 'lodash-es';
import { PropsWithChildren } from 'react';

export type GridLabelsProps = PropsWithChildren<Record<never, never>>;

export const GridLabels: React.FunctionComponent<GridLabelsProps> = ({ children }) => {
  return (
    <>
      <div className="vertical-labels">
        {Array.from('ABCDEFGHIJ').map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      {children}
      <div className="horizontal-labels">
        {range(1, 11).map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
    </>
  );
};
