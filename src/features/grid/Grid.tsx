import "./Grid.css";

export function Grid() {
  const gridSize = 10;

  const squareClick = (x: number, y: number) => {
    console.log(`${x}:${y}`);
  };

  return (
    <div className="grid">
      {Array(gridSize * gridSize)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            onClick={() => squareClick(Math.floor(index / 10), index % 10)}
          ></div>
        ))}
    </div>
  );
}
