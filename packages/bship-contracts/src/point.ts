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

export function contains({ x, y }: Point, [lower, upper]: Rect): boolean {
  return x >= lower.x && x <= upper.x && y >= lower.y && y <= upper.y;
}

/**
 * Checks point upper bound
 * @param point point to check
 * @param upperBound exclusive upper-bound
 * @returns true if point is inside bound, otherwise - false
 */
export function upperBound(point: Point, upperBound: number): boolean {
  return contains(point, [
    { x: 0, y: 0 },
    { x: upperBound - 1, y: upperBound - 1 },
  ]);
}

export function intersects([head1, tail1]: Rect, [head2, tail2]: Rect): boolean {
  const intersectX = head2.x <= tail1.x && tail2.x >= head1.x;
  const intersectY = head2.y <= tail1.y && tail2.y >= head1.y;

  return intersectX && intersectY;
}

export function expandBy([head, tail]: Rect, value: number): Rect {
  return [
    { x: head.x - value, y: head.y - value },
    { x: tail.x + value, y: tail.y + value },
  ];
}
