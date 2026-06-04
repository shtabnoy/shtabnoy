export function groupBy<T, K extends PropertyKey>(
  items: T[],
  keySelector: (item: T) => K,
) {
  const result = {} as Record<K, T[]>;

  items.forEach((item) => {
    const key = keySelector(item);
    (result[key] ??= []).push(item);
  });

  return result;
}
