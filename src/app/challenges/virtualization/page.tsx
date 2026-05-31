'use client';

import { useRef, useState } from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────

const items = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  label: `Item ${i.toString().padStart(5, '0')}`,
  value: (i * 7919) % 1_000_000,
}));

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 48;
const WINDOW_HEIGHT = 480;
const OVERSCAN = 3;
const items_in_window = Math.ceil(WINDOW_HEIGHT / ITEM_HEIGHT);

// ─── Component ───────────────────────────────────────────────────────────────

export default function VirtualList() {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(items_in_window + OVERSCAN);
  const isScheduled = useRef(false);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (isScheduled.current) return;
    isScheduled.current = true;

    // Capture before the event is recycled by React
    const el = event.currentTarget;

    requestAnimationFrame(() => {
      const scrollTop = el.scrollTop;
      const start = Math.floor(scrollTop / ITEM_HEIGHT);
      const end = Math.min(start + items_in_window, items.length);

      setStartIndex(Math.max(0, start - OVERSCAN));
      setEndIndex(Math.min(items.length, end + OVERSCAN));

      isScheduled.current = false;
    });
  };

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * ITEM_HEIGHT;

  return (
    <div className="virtual-list-root">
      {/* Header */}
      <div className="vl-header">
        <span className="vl-title">Virtual List</span>
        <span className="vl-meta">
          {items.length.toLocaleString()} items &mdash; {visibleItems.length} in
          DOM
        </span>
      </div>

      {/* Scroll container */}
      <div
        className="vl-scroller"
        style={{ height: WINDOW_HEIGHT }}
        onScroll={handleScroll}
      >
        {/* Spacer: full height so scrollbar is correct */}
        <div
          className="vl-spacer"
          style={{ height: items.length * ITEM_HEIGHT }}
        >
          {/* Slice shifted into position via a single translateY */}
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="vl-item"
                style={{ height: ITEM_HEIGHT }}
              >
                <span className="vl-item-index">
                  #{item.id.toString().padStart(5, '0')}
                </span>
                <span className="vl-item-label">{item.label}</span>
                <span className="vl-item-value">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="vl-footer">
        <span>
          rows {startIndex}–{endIndex} visible
        </span>
        <span>approach: transform translateY + RAF throttle</span>
      </div>

      <style>{`
        .virtual-list-root {
          font-family: 'DM Mono', 'Fira Mono', monospace;
          background: #0a0a0a;
          border: 1px solid #1e1e1e;
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          max-width: 640px;
          color: #e0e0e0;
          margin: auto;
          margin-top: 50px;
        }

        .vl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-bottom: 1px solid #1e1e1e;
          background: #0d0d0d;
        }

        .vl-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a3e635;
        }

        .vl-meta {
          font-size: 11px;
          color: #4a4a4a;
          letter-spacing: 0.04em;
        }

        .vl-scroller {
          overflow-y: scroll;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: #2a2a2a #0a0a0a;
        }

        .vl-scroller::-webkit-scrollbar { width: 4px; }
        .vl-scroller::-webkit-scrollbar-track { background: #0a0a0a; }
        .vl-scroller::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

        .vl-spacer {
          position: relative;
          width: 100%;
        }

        .vl-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 20px;
          border-bottom: 1px solid #141414;
          transition: background 0.1s;
        }

        .vl-item:hover {
          background: #111111;
        }

        .vl-item-index {
          font-size: 11px;
          color: #2e2e2e;
          letter-spacing: 0.06em;
          flex-shrink: 0;
          width: 60px;
        }

        .vl-item-label {
          font-size: 13px;
          color: #888;
          flex: 1;
        }

        .vl-item-value {
          font-size: 12px;
          color: #a3e635;
          text-align: right;
          flex-shrink: 0;
        }

        .vl-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          border-top: 1px solid #1e1e1e;
          background: #0d0d0d;
          font-size: 10px;
          color: #2e2e2e;
          letter-spacing: 0.06em;
        }
      `}</style>
    </div>
  );
}
