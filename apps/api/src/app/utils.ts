import { Player } from '@bship/contracts';

export function mapFirstEntry<K, V>(map: Map<K, V>): [K, V] | undefined {
  return [...map][0];
}

export function mapLastEntry<K, V>(map: Map<K, V>): [K, V] | undefined {
  return [...map][map.size - 1];
}

export function nextPlayer(current: Player): Player {
  return current === Player.P1 ? Player.P2 : Player.P1;
}
