export function mapFirstEntry<K, V>(map: Map<K, V>): [K, V] | undefined {
  return [...map][0];
}

export function mapLastEntry<K, V>(map: Map<K, V>): [K, V] | undefined {
  return [...map][map.size - 1];
}
