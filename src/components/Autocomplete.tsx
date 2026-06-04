import { debounce } from '@/utils/useDebounce';
import { ReactNode, useMemo, useState } from 'react';

type AutocompleteProps<T> = {
  onSearch: (query: string, signal: AbortSignal) => Promise<T[]>;
  renderItem: (item: T) => ReactNode;
  onSelect: (item: T) => void;
  getKey: (item: T) => string | number;
  placeholder?: string;
  minQueryLength?: number; // default 1
  debounceMs?: number; // default 300
};

type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export default function Autocomplete<T>(
  props: AutocompleteProps<T>,
): JSX.Element {
  const {
    placeholder,
    debounceMs = 300,
    minQueryLength = 1,
    onSearch,
    renderItem,
    onSelect,
    getKey,
  } = props;
  const [items, setItems] = useState<T[]>([]);
  const [query, setQuery] = useState<string>('');
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' });

  const abortController = new AbortController();

  const debouncedSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        if (q.length <= minQueryLength) return;

        const result = await onSearch(q, abortController.signal);
        setItems(result);
      }, debounceMs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <input
        role="combobox"
        // aria-expanded={}
        aria-controls="listbox-id"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          debouncedSearch(e.target.value);
        }}
      />
      {query.length > minQueryLength && state.status === 'loading' ? (
        <div>Loading...</div>
      ) : state.status === 'error' ? (
        <div>{state.error.message}</div>
      ) : (
        state.status === 'success' &&
        state.data(
          <div
            role="listbox"
            // aria-selected={}
            id="listbox-id"
          >
            {items.map((item) => {
              return (
                <div
                  key={getKey(item)}
                  role="option"
                  onClick={() => onSelect(item)}
                >
                  {renderItem(item)}
                </div>
              );
            })}
          </div>,
        )
      )}
    </>
  );
}
