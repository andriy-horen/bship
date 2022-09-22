import classNames from "classnames";
import { range } from "lodash-es";
import { useDrag } from "react-dnd";
import "./Battleship.css";
import { ItemTypes } from "../dnd/itemTypes";
import { useEffect } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";

export interface BattleshipProps {
  size: number;
  orientation: "v" | "h";
  position: [number, number];
}

export function Battleship({ size, orientation, position }: BattleshipProps) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.Battleship,
    item: { size, orientation, position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

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
