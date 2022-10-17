export interface Point {
  x: number;
  y: number;
}

export type Rect = [Point, Point];

export function isEqual(p1: Point, p2: Point): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}

export function add(p1: Point, p2: Point): Point {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
}

export function insideBounds({ x, y }: Point, [lower, upper]: Rect): boolean {
  return x >= lower.x && x <= upper.x && y >= lower.y && y <= upper.y;
}

export function insideBoundsSize(point: Point, size: number): boolean {
  return insideBounds(point, [
    { x: 0, y: 0 },
    { x: size - 1, y: size - 1 },
  ]);
}

export function intersects([head1, tail1]: Rect, [head2, tail2]: Rect): boolean {
  const intersectX = head2.x <= tail1.x && tail2.x >= head1.x;
  const intersectY = head2.y <= tail1.y && tail2.y >= head1.y;

  return intersectX && intersectY;
}

export function expandRect([head, tail]: Rect): Rect {
  return [
    { x: head.x - 1, y: head.y - 1 },
    { x: tail.x + 1, y: tail.y + 1 },
  ];
}
