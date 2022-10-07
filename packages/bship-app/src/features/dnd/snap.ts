export function snapToGrid(position: [number, number], gridSize: number): [number, number] {
  const [x, y] = position;

  const snappedX = Math.round(x / gridSize) * gridSize;
  const snappedY = Math.round(y / gridSize) * gridSize;
  return [snappedX, snappedY];
}
