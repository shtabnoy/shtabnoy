import { useEffect, useState } from 'react';

type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export function useFetch<T>(url: string | null): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' });

  useEffect(() => {
    if (!url) {
      setState({ status: 'idle' });
      return;
    }

    setState({ status: 'loading' });

    const abortController = new AbortController();
    let cancelled = false;

    fetch(url, { signal: abortController.signal })
      .then((res: Response) => {
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: T) => {
        if (cancelled) return;
        setState({ status: 'success', data });
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.name === 'AbortError') return;
        setState({ status: 'error', error });
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [url]);

  return state;
}
