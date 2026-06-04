import { useEffect, useId, useState, ReactNode } from 'react';

type AutocompleteProps<T> = {
  onSearch: (query: string, signal: AbortSignal) => Promise<T[]>;
  renderItem: (item: T) => ReactNode;
  onSelect: (item: T) => void;
  getKey: (item: T) => string | number;
  placeholder?: string;
  minQueryLength?: number;
  debounceMs?: number;
};

type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T[] }
  | { status: 'empty' }
  | { status: 'error'; error: Error };

export default function Autocomplete<T>(props: AutocompleteProps<T>) {
  const {
    onSearch,
    renderItem,
    onSelect,
    getKey,
    placeholder,
    minQueryLength = 1,
    debounceMs = 300,
  } = props;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' });
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listboxId = useId();

  // Debounce query → debouncedQuery
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs]);

  // Search on debouncedQuery
  useEffect(() => {
    if (debouncedQuery.length < minQueryLength) {
      setState({ status: 'idle' });
      return;
    }

    setState({ status: 'loading' });
    const controller = new AbortController();
    let cancelled = false;

    onSearch(debouncedQuery, controller.signal)
      .then((data) => {
        if (cancelled) return;
        setState(
          data.length === 0 ? { status: 'empty' } : { status: 'success', data },
        );
        setHighlightedIndex(0);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        const e = err instanceof Error ? err : new Error(String(err));
        setState({ status: 'error', error: e });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedQuery, minQueryLength, onSearch]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (state.status !== 'success') return;
    const items = state.data;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectItem(items[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setState({ status: 'idle' });
      setQuery('');
    }
  }

  function selectItem(item: T) {
    onSelect(item);
    setQuery('');
    setState({ status: 'idle' });
  }

  let dropdown: ReactNode = null;
  if (state.status === 'loading') dropdown = <div>Loading...</div>;
  else if (state.status === 'empty') dropdown = <div>No results</div>;
  else if (state.status === 'error')
    dropdown = <div>Error: {state.error.message}</div>;
  else if (state.status === 'success') {
    dropdown = (
      <div role="listbox" id={listboxId}>
        {state.data.map((item, i) => (
          <div
            key={getKey(item)}
            id={`${listboxId}-option-${i}`}
            role="option"
            aria-selected={i === highlightedIndex}
            onClick={() => selectItem(item)}
            style={{
              backgroundColor: i === highlightedIndex ? '#eef' : 'transparent',
              color: i === highlightedIndex ? 'black' : 'white',
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <input
        style={{ color: 'black' }}
        role="combobox"
        aria-expanded={state.status !== 'idle'}
        aria-controls={listboxId}
        aria-activedescendant={
          state.status === 'success'
            ? `${listboxId}-option-${highlightedIndex}`
            : undefined
        }
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {state.status !== 'idle' && dropdown}
    </div>
  );
}
