'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { debounce } from '@/utils/useDebounce';

/* ───────── code strings ───────── */
const CODE_FINAL = `function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
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
}`;

const CODE_NAIVE = `// ❌ Common first attempt — missing key details

function debounce(callback: (args: any) => void, delay: number) {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  return function (query: string) {       // ← hardcoded to one arg
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      callback(query);                     // ← loses \`this\` context
    }, delay);
  };
}

// Problems:
// 1. Only accepts a single string argument — not generic
// 2. \`this\` context is lost — breaks method debouncing
// 3. No cancel() — can't clean up in useEffect
// 4. No type safety — callback typed as \`any\``;

/* ───────── timeline event types ───────── */
interface TimelineEvent {
  time: number;
  type: 'keystroke' | 'raw-fire' | 'debounced-fire' | 'timer-reset';
  label: string;
}

/* ───────── sub-components ───────── */
function Timeline({
  events,
  startTime,
}: {
  events: TimelineEvent[];
  startTime: number;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-dim font-display text-[13px]">
        Start typing above to see the timeline
      </div>
    );
  }

  const maxTime = Math.max(...events.map((e) => e.time - startTime), 1000);
  const timelineWidth = maxTime + 500;

  return (
    <div className="overflow-x-auto pb-4">
      <div
        className="min-w-[600px] relative"
        style={{ width: `${Math.max(600, timelineWidth / 3)}px` }}
      >
        {/* Raw calls lane */}
        <div className="mb-6">
          <div className="font-display text-[11px] text-coral uppercase tracking-[1px] mb-2">
            Raw (no debounce)
          </div>
          <div className="h-10 bg-bg rounded relative border border-white/[0.04]">
            {events
              .filter((e) => e.type === 'raw-fire')
              .map((e, i) => {
                const left = ((e.time - startTime) / timelineWidth) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-1 bottom-1 w-1.5 bg-coral rounded-sm transition-all duration-150"
                    style={{ left: `${left}%` }}
                    title={`"${e.label}" at ${Math.round(e.time - startTime)}ms`}
                  />
                );
              })}
          </div>
          <div className="font-display text-[11px] text-dim mt-1">
            {events.filter((e) => e.type === 'raw-fire').length} calls
          </div>
        </div>

        {/* Debounced lane */}
        <div className="mb-6">
          <div className="font-display text-[11px] text-accent uppercase tracking-[1px] mb-2">
            Debounced (300ms)
          </div>
          <div className="h-10 bg-bg rounded relative border border-white/[0.04]">
            {/* Timer reset markers */}
            {events
              .filter((e) => e.type === 'timer-reset')
              .map((e, i) => {
                const left = ((e.time - startTime) / timelineWidth) * 100;
                return (
                  <div
                    key={`r-${i}`}
                    className="absolute top-1 bottom-1 w-0.5 bg-yellow-400/30 rounded-sm"
                    style={{ left: `${left}%` }}
                    title={`Timer reset at ${Math.round(e.time - startTime)}ms`}
                  />
                );
              })}
            {/* Actual fires */}
            {events
              .filter((e) => e.type === 'debounced-fire')
              .map((e, i) => {
                const left = ((e.time - startTime) / timelineWidth) * 100;
                return (
                  <div
                    key={`d-${i}`}
                    className="absolute top-0.5 bottom-0.5 flex items-center"
                    style={{ left: `${left}%` }}
                  >
                    <div className="w-2 h-8 bg-accent rounded-sm" />
                    <span className="font-display text-[10px] text-accent ml-1.5 whitespace-nowrap">
                      &quot;{e.label}&quot;
                    </span>
                  </div>
                );
              })}
          </div>
          <div className="font-display text-[11px] text-dim mt-1">
            {events.filter((e) => e.type === 'debounced-fire').length} calls
            {events.filter((e) => e.type === 'timer-reset').length > 0 && (
              <span className="text-yellow-400/50">
                {' '}
                · {events.filter((e) => e.type === 'timer-reset').length} resets
              </span>
            )}
          </div>
        </div>

        {/* Keystroke lane */}
        <div>
          <div className="font-display text-[11px] text-muted uppercase tracking-[1px] mb-2">
            Keystrokes
          </div>
          <div className="h-8 bg-bg rounded relative border border-white/[0.04]">
            {events
              .filter((e) => e.type === 'keystroke')
              .map((e, i) => {
                const left = ((e.time - startTime) / timelineWidth) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-1 bottom-1 flex flex-col items-center"
                    style={{ left: `${left}%` }}
                  >
                    <div className="w-4 h-5 bg-elevated border border-white/[0.08] rounded-sm flex items-center justify-center">
                      <span className="font-display text-[9px] text-muted">
                        {e.label}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeBlock() {
  const [tab, setTab] = useState<'final' | 'naive'>('final');
  const code = tab === 'final' ? CODE_FINAL : CODE_NAIVE;

  return (
    <div className="bg-surface border border-white/[0.05] rounded-lg overflow-hidden mb-8">
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
        <span className="font-display text-[12px] text-muted">debounce.ts</span>
        <div className="flex gap-1">
          {(['final', 'naive'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-display text-[11px] px-3 py-1 rounded transition-all duration-200 ${
                tab === t
                  ? 'text-accent bg-accent/10'
                  : 'text-dim hover:text-primary'
              }`}
            >
              {t === 'final' ? 'Final' : 'Naive (broken)'}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="font-display text-[13px] leading-[1.9] text-muted whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  );
}

/* ───────── main page ───────── */

const takeaways = [
  {
    icon: '⏱',
    title: 'Closures hold state',
    text: "The timerId variable lives in a closure, invisible to the outside world. Each call to the debounced function reads and writes the same timerId — that's what makes cancellation work.",
  },
  {
    icon: '🔄',
    title: 'clearTimeout is the key',
    text: 'Every new call clears the previous timer before setting a new one. This "reset the clock" pattern is the entire mechanic behind debounce.',
  },
  {
    icon: '👆',
    title: 'this binding matters',
    text: 'Using fn.apply(this, args) preserves the calling context. Without it, debouncing an object method would lose its reference to the object.',
  },
  {
    icon: '🧹',
    title: 'cancel() enables cleanup',
    text: 'In React, components unmount. Without cancel(), a debounced callback can fire after unmount, causing state updates on dead components — the classic memory leak.',
  },
];

export default function DebouncePage() {
  const [inputValue, setInputValue] = useState('');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [rawCount, setRawCount] = useState(0);
  const [debouncedResult, setDebouncedResult] = useState('');
  const startTimeRef = useRef(0);
  const hasStarted = useRef(false);
  const [delay, setDelay] = useState(300);

  const addEvent = useCallback((type: TimelineEvent['type'], label: string) => {
    const now = performance.now();
    setEvents((prev) => [...prev, { time: now, type, label }]);
  }, []);

  // Create debounced handler — recreated when delay changes
  const debouncedHandlerRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    debouncedHandlerRef.current = debounce((value: string) => {
      setDebouncedResult(value);
      const now = performance.now();
      setEvents((prev) => [
        ...prev,
        { time: now, type: 'debounced-fire', label: value },
      ]);
    }, delay);

    return () => {
      debouncedHandlerRef.current?.cancel();
    };
  }, [delay]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (!hasStarted.current) {
        startTimeRef.current = performance.now();
        hasStarted.current = true;
      }

      const lastChar = value.slice(-1) || '⌫';

      // Raw fire — every keystroke
      setRawCount((c) => c + 1);
      addEvent('raw-fire', value);
      addEvent('keystroke', lastChar);

      // Debounced — resets timer
      addEvent('timer-reset', lastChar);
      debouncedHandlerRef.current?.(value);
    },
    [addEvent],
  );

  const handleReset = useCallback(() => {
    setInputValue('');
    setEvents([]);
    setRawCount(0);
    setDebouncedResult('');
    hasStarted.current = false;
    startTimeRef.current = 0;
    debouncedHandlerRef.current?.cancel();
  }, []);

  return (
    <>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-bg/85 backdrop-blur-md border-b border-white/[0.04]">
        <Link
          href="/"
          className="font-display text-[15px] text-primary tracking-tight"
          style={{ opacity: 1 }}
        >
          denis<span className="text-accent">.</span>shtabnoy
        </Link>
        <Link
          href="/"
          className="font-display text-[13px] text-muted uppercase tracking-[1.5px] transition-colors duration-200 hover:text-accent hover:opacity-100"
        >
          ← Home
        </Link>
      </nav>

      <main className="pt-32 pb-24">
        {/* Hero */}
        <div className="max-w-content mx-auto px-8 mb-16">
          <Reveal>
            <div className="font-display text-[12px] text-dim mb-8">
              <Link href="/" className="text-accent hover:underline">
                shtabnoy.com
              </Link>{' '}
              / challenges / debounce
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="inline-block font-display text-[11px] uppercase tracking-[1.5px] text-[#c8ff3e] bg-[#c8ff3e]/10 px-3 py-1 rounded mb-4">
              ✦ JS fundamentals
            </div>
          </Reveal>
          <Reveal delay={160}>
            <h1 className="font-display font-bold leading-[1.2] tracking-tight mb-6 text-[clamp(1.8rem,4vw,2.8rem)]">
              Building <span className="text-accent">debounce</span>
              <br />
              from scratch
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-[1.1rem] text-muted max-w-[580px] leading-[1.7] mb-6">
              Type fast and watch what happens. The raw handler fires on every
              keystroke. The debounced version waits until you stop typing. Same
              input, dramatically different behavior — and it&apos;s only 20
              lines of code.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="flex flex-wrap gap-1.5">
              {[
                'closures',
                'setTimeout',
                'this binding',
                'generics',
                'cleanup',
              ].map((t) => (
                <span
                  key={t}
                  className="font-display text-[11px] px-2.5 py-1 rounded border border-dim text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Interactive section */}
        <section className="max-w-content mx-auto px-8 mb-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // try it
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-2 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              Type something and watch the timeline
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              Every keystroke fires the raw handler immediately. The debounced
              version only fires once you pause for {delay}ms. Try typing fast,
              then slow, and see how the calls differ.
            </p>
          </Reveal>

          <Reveal delay={240}>
            {/* Input + controls */}
            <div className="flex gap-3 mb-4 flex-wrap items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="font-display text-[11px] text-dim uppercase tracking-[1px] block mb-2">
                  Search query
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInput}
                  placeholder="Start typing..."
                  className="w-full bg-surface border border-white/[0.08] rounded-lg px-4 py-3 font-display text-[14px] text-primary placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
              <div>
                <label className="font-display text-[11px] text-dim uppercase tracking-[1px] block mb-2">
                  Delay
                </label>
                <select
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value))}
                  className="bg-surface border border-white/[0.08] rounded-lg px-4 py-3 font-display text-[14px] text-primary focus:outline-none focus:border-accent/40 transition-colors appearance-none cursor-pointer"
                >
                  <option value={100}>100ms</option>
                  <option value={300}>300ms</option>
                  <option value={500}>500ms</option>
                  <option value={1000}>1000ms</option>
                </select>
              </div>
              <button
                onClick={handleReset}
                className="font-display text-[12px] font-medium px-5 py-3 rounded-lg bg-elevated text-primary border border-white/[0.08] transition-all duration-200 hover:border-accent"
              >
                ↺ Reset
              </button>
            </div>

            {/* Live stats */}
            <div className="flex gap-4 mb-6 flex-wrap">
              <div className="bg-surface border border-white/[0.05] rounded-lg px-4 py-3 min-w-[140px]">
                <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-1">
                  Raw calls
                </div>
                <div className="font-display text-[1.5rem] font-bold text-coral leading-none">
                  {rawCount}
                </div>
              </div>
              <div className="bg-surface border border-white/[0.05] rounded-lg px-4 py-3 min-w-[140px]">
                <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-1">
                  Debounced calls
                </div>
                <div className="font-display text-[1.5rem] font-bold text-accent leading-none">
                  {events.filter((e) => e.type === 'debounced-fire').length}
                </div>
              </div>
              <div className="bg-surface border border-white/[0.05] rounded-lg px-4 py-3 min-w-[140px]">
                <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-1">
                  Calls saved
                </div>
                <div className="font-display text-[1.5rem] font-bold text-yellow-400 leading-none">
                  {Math.max(
                    0,
                    rawCount -
                      events.filter((e) => e.type === 'debounced-fire').length,
                  )}
                </div>
              </div>
              {debouncedResult && (
                <div className="bg-surface border border-white/[0.05] rounded-lg px-4 py-3 flex-1 min-w-[140px]">
                  <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-1">
                    Last debounced value
                  </div>
                  <div className="font-display text-[1rem] font-bold text-accent leading-none truncate">
                    &quot;{debouncedResult}&quot;
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-surface border border-white/[0.05] rounded-lg p-5 mb-8">
              <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-4">
                Event timeline →
              </div>
              <Timeline events={events} startTime={startTimeRef.current} />
            </div>
          </Reveal>
        </section>

        {/* Code section */}
        <section className="max-w-content mx-auto px-8 mb-16 border-t border-white/[0.04] pt-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // the code
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-2 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              20 lines that save thousands of API calls
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              A closure, a timer, and clearTimeout. That&apos;s the entire
              trick. The generic typing and cancel method are what make it
              production-grade.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <CodeBlock />
          </Reveal>

          {/* Annotations */}
          <Reveal delay={320}>
            <div className="bg-elevated border-l-[3px] border-accent px-5 py-4 rounded-r-lg mb-4">
              <div className="font-display text-[11px] text-accent uppercase tracking-[1px] mb-1">
                💡 Key insight
              </div>
              <p className="text-[13px] text-muted leading-[1.7]">
                The{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  timerId
                </code>{' '}
                variable is trapped in a closure — it persists across calls but
                is invisible from outside. Each invocation of the debounced
                function reads and mutates the same timer. This is closures
                doing real work, not just an interview trivia question.
              </p>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="bg-elevated border-l-[3px] border-coral px-5 py-4 rounded-r-lg mb-4">
              <div className="font-display text-[11px] text-coral uppercase tracking-[1px] mb-1">
                ⚠ React gotcha
              </div>
              <p className="text-[13px] text-muted leading-[1.7]">
                Don&apos;t create the debounced function inside a component
                render — it gets recreated every render, losing the timer state.
                Use{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  useRef
                </code>{' '}
                or{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  useMemo
                </code>{' '}
                to keep a stable reference. And always call{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  cancel()
                </code>{' '}
                in your cleanup function.
              </p>
            </div>
          </Reveal>
        </section>

        {/* Takeaways */}
        <section className="max-w-content mx-auto px-8 border-t border-white/[0.04] pt-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // takeaways
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-8 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              What this exercise teaches
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {takeaways.map((t, i) => (
              <Reveal key={t.title} delay={160 + i * 80}>
                <div className="bg-surface border border-white/[0.05] rounded-lg p-6">
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="font-display text-[13px] font-semibold mb-1">
                    {t.title}
                  </div>
                  <div className="text-[13px] text-muted leading-[1.6]">
                    {t.text}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.04]">
        <div className="max-w-content mx-auto px-8 flex justify-between items-center font-display text-[11px] text-dim">
          <span>
            Built by{' '}
            <Link href="/" className="text-accent hover:underline">
              Denis Shtabnoy
            </Link>
          </span>
          <span>Challenge #002</span>
        </div>
      </footer>
    </>
  );
}
