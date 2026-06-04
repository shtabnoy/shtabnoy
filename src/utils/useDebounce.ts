export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
) {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  function cancel() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  const debouncedFn = function (this: any, ...args: Parameters<T>) {
    cancel();
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };

  debouncedFn.cancel = function () {
    cancel();
  };

  return debouncedFn;
}
