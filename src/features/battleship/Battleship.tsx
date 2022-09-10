import classNames from "classnames";
import { range } from "lodash-es";
import { useDrag } from "react-dnd";
import "./Battleship.css";
import { ItemTypes } from "../../app/item-types";

export interface BattleshipProps {
  size: number;
  orientation: "v" | "h";
}

export function Battleship({ size, orientation }: BattleshipProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.Battleship,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={classNames({
        battleship: true,
        vertical: orientation === "v",
        horizontal: orientation === "h",
      })}
    >
      {range(size).map((index) => (
        <div
          key={index}
          className={classNames({
            "battleship-section": true,
            head: index === 0,
            tail: index === size - 1,
          })}
        ></div>
      ))}
    </div>
  );
}
