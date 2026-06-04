export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number,
): Promise<T> {
  if (attempts < 1) throw new Error('attempts must be at least 1');

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
