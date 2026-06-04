import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalStorage', () => {
  it('returns the initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'Alice'));
    expect(result.current[0]).toBe('Alice');
  });

  it('reads an existing value from localStorage', () => {
    localStorage.setItem('key', JSON.stringify('Bob'));
    const { result } = renderHook(() => useLocalStorage('key', 'Alice'));
    expect(result.current[0]).toBe('Bob');
  });

  it('updates the value and persists it to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'Alice'));
    act(() => result.current[1]('Bob'));
    expect(result.current[0]).toBe('Bob');
    expect(JSON.parse(localStorage.getItem('key')!)).toBe('Bob');
  });

  it('supports an updater function like useState', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'Alice'));
    act(() => result.current[1]((prev) => prev + '!'));
    expect(result.current[0]).toBe('Alice!');
  });

  it('works with non-string values', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => result.current[1](42));
    expect(result.current[0]).toBe(42);
    expect(JSON.parse(localStorage.getItem('count')!)).toBe(42);
  });

  it('does not crash when localStorage is unavailable (SSR)', () => {
    const original = globalThis.localStorage;
    // @ts-expect-error simulating SSR
    delete globalThis.localStorage;
    expect(() =>
      renderHook(() => useLocalStorage('key', 'Alice')),
    ).not.toThrow();
    globalThis.localStorage = original;
  });
});
