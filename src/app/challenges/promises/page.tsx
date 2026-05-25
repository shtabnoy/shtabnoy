'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { promiseAll } from '@/utils/promiseAll';
import Reveal from '@/components/Reveal';

/* ───────── types ───────── */
interface PromiseSpec {
  delay: number;
  label: string;
  willReject: boolean;
  create: () => Promise<string>;
}

interface LogEntry {
  time: string;
  msg: string;
  type: 'ok' | 'err' | 'info';
}

/* ───────── promise factory ───────── */
function makePromises(includeReject: boolean): PromiseSpec[] {
  const specs = [
    { delay: 800, label: 'fetch users' },
    { delay: 400, label: 'load config' },
    { delay: 1200, label: 'query DB' },
    { delay: 200, label: 'check cache' },
    { delay: 600, label: 'auth token' },
  ];

  return specs.map((s, i) => ({
    ...s,
    willReject: includeReject && i === 1,
    create: () =>
      new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          if (includeReject && i === 1)
            reject(new Error('Config server timeout'));
          else resolve(`${s.label}: OK`);
        }, s.delay);
      }),
  }));
}

/* ───────── code strings ───────── */
const CODE_FINAL = `export function promiseAll<T>(promises: (T | Promise<T>)[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const result: T[] = [];
    let counter = 0;
    const total = promises.length;

    // Edge case: empty array resolves immediately
    if (total === 0) {
      resolve([]);
      return;
    }

    promises.forEach((promise, index) => {
      // Wrap with Promise.resolve to handle non-promise values
      Promise.resolve(promise)
        .then((res) => {
          result[index] = res;  // index preserves order
          counter++;            // counter tracks completion
          if (counter === total) {
            resolve(result);
          }
        })
        .catch((error) => {
          reject(error);  // reject immediately, don't wait
        });
    });
  });
}`;

const CODE_NAIVE = `// ❌ The naive approach — looks right, works wrong

export async function promiseAll(promises: Promise<any>[]): Promise<any> {
  const results: any[] = [];

  for (let p of promises) {
    const resolved = await p;   // ← waits for EACH before starting next
    results.push(resolved);
  }

  return new Promise((resolve) => {
    resolve(results);            // ← unnecessary wrapper
  });
}

// Problems:
// 1. Sequential, not concurrent — 5× slower
// 2. Rejection only caught after all prior promises resolve
// 3. Doesn't handle non-promise values`;

/* ───────── sub-components ───────── */

function PillRow({
  specs,
  states,
}: {
  specs: PromiseSpec[];
  states: string[];
}) {
  return (
    <div className="flex gap-1.5 flex-wrap px-5 py-3 bg-white/[0.02] border-b border-white/[0.04]">
      {specs.map((s, i) => {
        const state = states[i] || 'pending';
        const cls =
          state === 'resolved'
            ? 'bg-accent/10 text-accent'
            : state === 'rejected'
              ? 'bg-coral/10 text-coral'
              : 'bg-yellow-400/10 text-yellow-400';
        return (
          <span
            key={i}
            className={`font-display text-[11px] px-2.5 py-1 rounded ${cls} transition-all duration-300`}
          >
            {s.label} ({s.delay}ms){s.willReject ? ' ✕' : ''}
          </span>
        );
      })}
    </div>
  );
}

function RaceLane({
  label,
  color,
  pct,
  barLabel,
  time,
  status,
}: {
  label: string;
  color: string;
  pct: number;
  barLabel: string;
  time: string;
  status: 'idle' | 'done' | 'failed';
}) {
  const timeCls =
    status === 'done'
      ? 'text-accent font-bold'
      : status === 'failed'
        ? 'text-coral font-bold'
        : 'text-dim';

  return (
    <div className="grid grid-cols-[100px_1fr_70px] md:grid-cols-[120px_1fr_80px] items-center px-5 py-3.5 border-b border-white/[0.03] last:border-b-0">
      <div className={`font-display text-[12px] font-medium ${color}`}>
        {label}
      </div>
      <div className="h-7 bg-bg rounded overflow-hidden relative">
        <div
          className="h-full rounded transition-[width] duration-100 ease-linear flex items-center justify-end pr-2"
          style={{
            width: `${pct}%`,
            background:
              color === 'text-coral'
                ? 'linear-gradient(90deg, #ff6b4a, #ff8f74)'
                : 'linear-gradient(90deg, #c8ff3e, #e0ff8a)',
          }}
        >
          {barLabel && (
            <span className="font-display text-[10px] text-black/70 font-bold whitespace-nowrap">
              {barLabel}
            </span>
          )}
        </div>
      </div>
      <div className={`font-display text-[12px] text-right ${timeCls}`}>
        {time}
      </div>
    </div>
  );
}

function LogBox({ entries }: { entries: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="bg-surface border border-white/[0.05] rounded-lg p-4 max-h-[200px] overflow-y-auto mb-8"
    >
      {entries.map((e, i) => {
        const cls =
          e.type === 'ok'
            ? 'text-accent'
            : e.type === 'err'
              ? 'text-coral'
              : 'text-blue-custom';
        return (
          <div key={i} className="font-display text-[12px] leading-[1.8]">
            <span className="text-dim">[{e.time}s]</span>{' '}
            <span className={cls}>{e.msg}</span>
          </div>
        );
      })}
    </div>
  );
}

function CodeBlock() {
  const [tab, setTab] = useState<'final' | 'naive'>('final');
  const code = tab === 'final' ? CODE_FINAL : CODE_NAIVE;

  return (
    <div className="bg-surface border border-white/[0.05] rounded-lg overflow-hidden mb-8">
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
        <span className="font-display text-[12px] text-muted">
          promiseAll.ts
        </span>
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
    icon: '⚡',
    title: 'Concurrency ≠ parallelism',
    text: "JavaScript is single-threaded. Promises don't run in parallel — they're scheduled concurrently. The event loop handles them as their async operations complete.",
  },
  {
    icon: '🔒',
    title: 'Closure captures index',
    text: 'Each .then() callback closes over its own index value. This is what preserves order even when promises resolve out of sequence.',
  },
  {
    icon: '💥',
    title: 'Fail-fast rejection',
    text: "Real Promise.all rejects the moment any input rejects — it doesn't wait for others. This is a design choice. Promise.allSettled takes the opposite approach.",
  },
  {
    icon: '🧩',
    title: 'Edge cases matter',
    text: 'Empty arrays, non-promise values, and the difference between index and counter — these details separate junior from senior implementations.',
  },
];

export default function PromisesPage() {
  const [running, setRunning] = useState(false);
  const [includeReject, setIncludeReject] = useState(false);
  const [specs, setSpecs] = useState<PromiseSpec[]>([]);
  const [pillStates, setPillStates] = useState<string[]>([]);
  const [seqPct, setSeqPct] = useState(0);
  const [conPct, setConPct] = useState(0);
  const [seqBarLabel, setSeqBarLabel] = useState('');
  const [conBarLabel, setConBarLabel] = useState('');
  const [seqTime, setSeqTime] = useState('—');
  const [conTime, setConTime] = useState('—');
  const [seqStatus, setSeqStatus] = useState<'idle' | 'done' | 'failed'>(
    'idle',
  );
  const [conStatus, setConStatus] = useState<'idle' | 'done' | 'failed'>(
    'idle',
  );
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: '0.00', msg: '→ Press "Run the race" to start', type: 'info' },
  ]);
  const [speedText, setSpeedText] = useState('');

  const addLog = useCallback((msg: string, type: LogEntry['type']) => {
    const t = (performance.now() / 1000).toFixed(2);
    setLogs((prev) => [...prev, { time: t, msg, type }]);
  }, []);

  const resetRace = useCallback(() => {
    setSpecs([]);
    setPillStates([]);
    setSeqPct(0);
    setConPct(0);
    setSeqBarLabel('');
    setConBarLabel('');
    setSeqTime('—');
    setConTime('—');
    setSeqStatus('idle');
    setConStatus('idle');
    setSpeedText('');
    setLogs([
      { time: '0.00', msg: '→ Press "Run the race" to start', type: 'info' },
    ]);
  }, []);

  const runRace = useCallback(async () => {
    if (running) return;
    setRunning(true);
    resetRace();

    const promiseSpecs = makePromises(includeReject);
    setSpecs(promiseSpecs);
    setPillStates(promiseSpecs.map(() => 'pending'));
    addLog('Race started — sequential vs concurrent', 'info');

    const totalDelay = promiseSpecs.reduce((s, p) => s + p.delay, 0);
    const maxDelay = Math.max(...promiseSpecs.map((p) => p.delay));

    // --- Sequential ---
    const seqStart = performance.now();
    let seqElapsed = 0;
    const seqPromise = (async () => {
      try {
        for (let i = 0; i < promiseSpecs.length; i++) {
          const result = await promiseSpecs[i].create();
          seqElapsed += promiseSpecs[i].delay;
          setSeqPct((seqElapsed / totalDelay) * 100);
          setSeqBarLabel(promiseSpecs[i].label);
          setSeqTime(`${seqElapsed}ms`);
          addLog(`[seq] ${result}`, 'ok');
        }
        const dur = Math.round(performance.now() - seqStart);
        setSeqTime(`${dur}ms`);
        setSeqStatus('done');
        setSeqPct(100);
        addLog(`[seq] All resolved in ${dur}ms`, 'ok');
      } catch (e: unknown) {
        const dur = Math.round(performance.now() - seqStart);
        setSeqTime('FAIL');
        setSeqStatus('failed');
        addLog(`[seq] Rejected after ${dur}ms: ${(e as Error).message}`, 'err');
      }
    })();

    // --- Concurrent ---
    const conStart = performance.now();
    const conPromises = promiseSpecs.map((s, i) => {
      const p = s.create();
      p.then(() => {
        setPillStates((prev) => {
          const next = [...prev];
          next[i] = 'resolved';
          return next;
        });
        const pct = Math.min(
          100,
          ((performance.now() - conStart) / maxDelay) * 100,
        );
        setConPct(pct);
        setConBarLabel(s.label);
        addLog(`[concurrent] ${s.label}: OK (${s.delay}ms)`, 'ok');
      }).catch(() => {
        setPillStates((prev) => {
          const next = [...prev];
          next[i] = 'rejected';
          return next;
        });
        addLog(`[concurrent] ${s.label}: REJECTED (${s.delay}ms)`, 'err');
      });
      return p;
    });

    const conPromise = promiseAll(conPromises)
      .then(() => {
        const dur = Math.round(performance.now() - conStart);
        setConTime(`${dur}ms`);
        setConStatus('done');
        setConPct(100);
        addLog(`[concurrent] All resolved in ${dur}ms`, 'ok');
      })
      .catch((e: Error) => {
        const dur = Math.round(performance.now() - conStart);
        setConTime('FAIL');
        setConStatus('failed');
        addLog(`[concurrent] Rejected after ${dur}ms: ${e.message}`, 'err');
      });

    await Promise.allSettled([seqPromise, conPromise]);

    if (!includeReject) {
      const ratio = (totalDelay / maxDelay).toFixed(1);
      setSpeedText(`Concurrent was ~${ratio}× faster`);
      addLog(`Concurrent was ~${ratio}× faster than sequential`, 'info');
    }

    setRunning(false);
  }, [running, includeReject, addLog, resetRace]);

  return (
    <>
      {/* Nav bar — simplified for sub-pages */}
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
              / challenges / promise-all
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="inline-block font-display text-[11px] uppercase tracking-[1.5px] text-accent bg-accent/10 px-3 py-1 rounded mb-4">
              ✦ JS fundamentals
            </div>
          </Reveal>
          <Reveal delay={160}>
            <h1 className="font-display font-bold leading-[1.2] tracking-tight mb-6 text-[clamp(1.8rem,4vw,2.8rem)]">
              Building <span className="text-accent">Promise.all</span>
              <br />
              from scratch
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-[1.1rem] text-muted max-w-[580px] leading-[1.7] mb-6">
              What happens when you{' '}
              <code className="font-display text-[0.9em] bg-elevated px-1.5 py-0.5 rounded">
                await
              </code>{' '}
              in a loop vs running promises concurrently? A visual deep-dive
              into one of JavaScript&apos;s most misunderstood patterns.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="flex flex-wrap gap-1.5">
              {['promises', 'concurrency', 'closures', 'async patterns'].map(
                (t) => (
                  <span
                    key={t}
                    className="font-display text-[11px] px-2.5 py-1 rounded border border-dim text-muted"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </Reveal>
        </div>

        {/* Race section */}
        <section className="max-w-content mx-auto px-8 mb-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // the race
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-2 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              Sequential vs concurrent execution
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              Watch 5 promises race. The sequential version awaits each one
              before starting the next. The concurrent version fires them all at
              once. Click run and see the difference.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex gap-2.5 mb-6 flex-wrap items-center">
              <button
                onClick={runRace}
                disabled={running}
                className="font-display text-[12px] font-medium px-5 py-2.5 rounded-md bg-accent text-bg transition-all duration-200 hover:bg-[#d9ff6e] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ▶ Run the race
              </button>
              <button
                onClick={resetRace}
                className="font-display text-[12px] font-medium px-5 py-2.5 rounded-md bg-elevated text-primary border border-white/[0.08] transition-all duration-200 hover:border-accent"
              >
                ↺ Reset
              </button>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeReject}
                  onChange={(e) => setIncludeReject(e.target.checked)}
                  className="accent-coral"
                />
                <span className="font-display text-[11px] text-muted">
                  Include a rejection
                </span>
              </label>
              {speedText && (
                <span className="font-display text-[12px] text-dim ml-auto">
                  {speedText}
                </span>
              )}
            </div>

            {/* Race arena */}
            <div className="bg-surface border border-white/[0.05] rounded-lg overflow-hidden mb-6">
              {specs.length > 0 && (
                <PillRow specs={specs} states={pillStates} />
              )}
              <div className="grid grid-cols-[100px_1fr_70px] md:grid-cols-[120px_1fr_80px] px-5 py-2.5 font-display text-[11px] text-dim uppercase tracking-[1px] bg-white/[0.02] border-b border-white/[0.04]">
                <div>Method</div>
                <div>Progress</div>
                <div className="text-right">Time</div>
              </div>
              <RaceLane
                label="Sequential"
                color="text-coral"
                pct={seqPct}
                barLabel={seqBarLabel}
                time={seqTime}
                status={seqStatus}
              />
              <RaceLane
                label="Concurrent"
                color="text-accent"
                pct={conPct}
                barLabel={conBarLabel}
                time={conTime}
                status={conStatus}
              />
            </div>
          </Reveal>

          <Reveal delay={320}>
            <LogBox entries={logs} />
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
              My implementation
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              No libraries. No cheating. Just the Promise constructor, a
              counter, and careful index tracking.
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
                  index
                </code>{' '}
                from{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  forEach
                </code>{' '}
                preserves the original order in the results array, while{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  counter
                </code>{' '}
                tracks how many promises have completed. These are two different
                jobs — confusing them is the most common bug in this exercise.
              </p>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="bg-elevated border-l-[3px] border-coral px-5 py-4 rounded-r-lg mb-4">
              <div className="font-display text-[11px] text-coral uppercase tracking-[1px] mb-1">
                ⚠ Common mistake
              </div>
              <p className="text-[13px] text-muted leading-[1.7]">
                Using{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  async/await
                </code>{' '}
                with a{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  for
                </code>{' '}
                loop creates sequential execution. Each{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  await
                </code>{' '}
                pauses the entire loop. The fix is to use{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  .then()
                </code>{' '}
                inside{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  forEach
                </code>{' '}
                so all promises run concurrently.
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
          <span>Challenge #001</span>
        </div>
      </footer>
    </>
  );
}
