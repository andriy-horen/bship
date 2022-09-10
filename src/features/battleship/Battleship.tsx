import classNames from "classnames";
import { range } from "lodash-es";
import "./Battleship.css";

export interface BattleshipProps {
  size: number;
  orientation: "v" | "h";
}

export function Battleship({ size, orientation }: BattleshipProps) {
  return (
    <div
      className={classNames({
        battleship: true,
        vertical: orientation === "v",
        horizontal: orientation === "h",
      })}
    >
      {range(size).map((i) => (
        <div
          className={classNames({
            "battleship-section": true,
            head: i === 0,
            tail: i === size - 1,
          })}
        ></div>
      ))}
    </div>
  );
}
