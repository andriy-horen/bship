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

export function intersects([tl1, br1]: Rect, [tl2, br2]: Rect): boolean {
  const intersectX = tl2.x <= br1.x && br2.x >= tl1.x;
  const intersectY = tl2.y <= br1.y && br2.y >= tl1.y;

  return intersectX && intersectY;
}

export function expandBy([tl, br]: Rect, value: number): Rect {
  return [
    { x: tl.x - value, y: tl.y - value },
    { x: br.x + value, y: br.y + value },
  ];
}

export function toPoints([tl, br]: Rect): Point[] {
  const result: Point[] = [];
  for (let x = tl.x; x <= br.x; x++) {
    for (let y = tl.y; y <= br.y; y++) {
      result.push({ x, y });
    }
  }

  return result;
}
