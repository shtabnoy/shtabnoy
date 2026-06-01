'use client';

import { usePriceFeed } from '@/utils/usePriceFeed';

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'ARB'];

function PriceTicker() {
  const prices = usePriceFeed('ws://fake');

  return (
    <div className="grid grid-cols-5 gap-3 font-mono text-sm">
      {SYMBOLS.map((symbol) => (
        <div
          key={symbol}
          className="flex flex-col gap-1 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3"
        >
          <span className="text-xs text-neutral-500">{symbol}</span>
          <span className="text-base font-medium tabular-nums">
            {prices[symbol] ? `$${prices[symbol].toLocaleString()}` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function WebsocketsPage() {
  return <PriceTicker />;
}
