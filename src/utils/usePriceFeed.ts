import { useEffect, useRef, useState } from 'react';
import { FakeWebSocket } from '@/lib/FakeWebSocket';

export function usePriceFeed(url: string) {
  const wsRef = useRef<FakeWebSocket>();
  const bufferRef = useRef<Record<string, number>>({});
  const rafRef = useRef<number>(0);
  const dirtyRef = useRef(false);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    function tick() {
      if (dirtyRef.current) {
        setPrices({ ...bufferRef.current });
        dirtyRef.current = false;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    wsRef.current = new FakeWebSocket(url);
    wsRef.current.onmessage = function (event) {
      const { symbol, price } = JSON.parse(event.data);
      bufferRef.current[symbol] = price;
      dirtyRef.current = true;
    };
    wsRef.current.onopen = function () {
      rafRef.current = requestAnimationFrame(tick);
    };

    return () => {
      wsRef.current?.close();
      if (wsRef.current) wsRef.current.onopen = null;
      cancelAnimationFrame(rafRef.current);
    };
  }, [url]);

  return prices;
}
