import { describe, it, expect, vi } from 'vitest';
import { retry } from './retry';

describe('retry', () => {
  it('returns the result when the function succeeds on the first attempt', async () => {
    const fn = vi.fn().mockResolvedValue(42);
    await expect(retry(fn, 3)).resolves.toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries and returns the result when the function eventually succeeds', async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      calls++;
      if (calls < 3) throw new Error('not yet');
      return 42;
    });
    await expect(retry(fn, 3)).resolves.toBe(42);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws the last error when all attempts fail', async () => {
    const error = new Error('always fails');
    const fn = vi.fn().mockRejectedValue(error);
    await expect(retry(fn, 3)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws immediately when attempts is 1 and the function fails', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(retry(fn, 1)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('preserves the return type of the wrapped function', async () => {
    const fn = async () => ({ ok: true });
    const result = await retry(fn, 1);
    expect(result.ok).toBe(true);
  });
});
