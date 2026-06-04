import { useState } from 'react';

export function useLocalStorage<T extends Exclude<unknown, Function>>(
  key: string,
  initialValue: T,
): [T, (valueOrUpdater: T | ((v: T) => T)) => void] {
  const [value, setValueState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (valueOrUpdater: T | ((v: T) => T)) => {
    setValueState((current) => {
      const next =
        typeof valueOrUpdater === 'function'
          ? (valueOrUpdater as (v: T) => T)(current)
          : valueOrUpdater;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // localStorage unavailable (SSR, private mode, quota exceeded)
      }
      return next;
    });
  };

  return [value, setValue];
}
