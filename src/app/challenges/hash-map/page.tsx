'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { HashMap } from '@/utils/hashMap';

/* ───────── code string ───────── */
const CODE_FINAL = `class HashMap<K extends string | number | boolean, V> {
  private _buckets: [key: K, value: V][][];
  private _size: number = 0;

  constructor(private bucketCount: number = 16) {
    this._buckets = Array.from({ length: bucketCount }, () => []);
  }

  hash(key: K): number {
    let hash = 0;
    const str = key.toString();
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % this.bucketCount;
    }
    return hash;                  // key → number → bucket index
  }

  set(key: K, value: V) {
    const bucketIndex = this.hash(key);
    const bucket = this._buckets[bucketIndex];
    const existing = bucket.findIndex((el) => el[0] === key);
    if (existing >= 0) {
      bucket[existing] = [key, value];  // update existing
    } else {
      bucket.push([key, value]);        // insert new
      this._size++;
    }
  }

  get(key: K): V | undefined {
    const bucketIndex = this.hash(key);
    return this._buckets[bucketIndex].find((el) => el[0] === key)?.[1];
  }

  delete(key: K): boolean {
    const bucketIndex = this.hash(key);
    const bucket = this._buckets[bucketIndex];
    const index = bucket.findIndex((el) => el[0] === key);
    if (index === -1) return false;
    bucket.splice(index, 1);
    this._size--;
    return true;
  }

  has(key: K): boolean {
    const bucketIndex = this.hash(key);
    return this._buckets[bucketIndex].some((el) => el[0] === key);
  }

  get size(): number { return this._size; }
  keys(): K[] { return this._buckets.flat().map((el) => el[0]); }
  values(): V[] { return this._buckets.flat().map((el) => el[1]); }
}`;

/* ───────── types ───────── */
interface LogEntry {
  msg: string;
  type: 'set' | 'get' | 'delete' | 'collision' | 'info' | 'error';
}

/* ───────── sub-components ───────── */

function BucketVisualizer({
  buckets,
  highlightIndex,
  collisionIndex,
}: {
  buckets: readonly [string, string][][];
  highlightIndex: number | null;
  collisionIndex: number | null;
}) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1">
      {buckets.map((bucket, i) => {
        const isHighlight = highlightIndex === i;
        const isCollision = collisionIndex === i;
        const borderColor = isCollision
          ? 'border-coral'
          : isHighlight
            ? 'border-accent'
            : 'border-white/[0.06]';
        const bgColor = isCollision
          ? 'bg-coral/5'
          : isHighlight
            ? 'bg-accent/5'
            : 'bg-surface';

        return (
          <div
            key={i}
            className={`${bgColor} border ${borderColor} rounded-lg p-1.5 transition-all duration-300 min-h-[80px] flex flex-col`}
          >
            <div className="font-display text-[9px] text-dim text-center mb-1">
              [{i}]
            </div>
            <div className="flex-1 flex flex-col gap-0.5 justify-end">
              {bucket.map((entry, j) => (
                <div
                  key={`${entry[0]}-${j}`}
                  className={`font-display text-[8px] px-1 py-0.5 rounded text-center truncate ${
                    bucket.length > 1
                      ? 'bg-coral/15 text-coral'
                      : 'bg-accent/15 text-accent'
                  }`}
                  title={`${entry[0]}: ${entry[1]}`}
                >
                  {entry[0]}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HashBreakdown({
  keyStr,
  bucketCount,
}: {
  keyStr: string;
  bucketCount: number;
}) {
  if (!keyStr) return null;

  const chars = keyStr.split('');
  let h = 0;
  const steps: { char: string; code: number }[] = [];

  for (let i = 0; i < chars.length; i++) {
    const code = chars[i].charCodeAt(0);
    h = (h * 31 + code) % (bucketCount * 100);
    steps.push({ char: chars[i], code });
  }

  const finalIndex = h % bucketCount;

  return (
    <div className="bg-elevated rounded-lg px-4 py-3 mb-4">
      <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-2">
        Hash breakdown for &quot;{keyStr}&quot;
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="font-display text-[11px] bg-bg px-1.5 py-0.5 rounded text-accent">
              &apos;{s.char}&apos;
            </span>
            <span className="font-display text-[10px] text-dim">
              → {s.code}
            </span>
            {i < steps.length - 1 && (
              <span className="font-display text-[10px] text-dim">×31 +</span>
            )}
          </div>
        ))}
      </div>
      <div className="font-display text-[12px] text-muted">
        hash = <span className="text-yellow-400">{h}</span>
        {' % '}
        <span className="text-muted">{bucketCount}</span>
        {' = bucket '}
        <span className="text-accent font-bold">[{finalIndex}]</span>
      </div>
    </div>
  );
}

function ComparisonTable() {
  const rows = [
    {
      feature: 'Key types',
      hashmap: 'string / number / boolean',
      map: 'any (objects, functions, etc.)',
      object: 'string / Symbol',
    },
    {
      feature: 'Insertion order',
      hashmap: '✕ not preserved',
      map: '✓ preserved',
      object: '~mostly preserved',
    },
    {
      feature: 'Size',
      hashmap: '.size — O(1) with counter',
      map: '.size — O(1)',
      object: 'Object.keys().length — O(n)',
    },
    {
      feature: 'Iteration',
      hashmap: '.keys() / .values()',
      map: 'for...of / .forEach()',
      object: 'for...in / Object.keys()',
    },
    {
      feature: 'Performance',
      hashmap: 'O(1) amortized',
      map: 'O(1) amortized',
      object: 'O(1) amortized',
    },
    {
      feature: 'Prototype pollution',
      hashmap: '✕ not possible',
      map: '✕ not possible',
      object: '⚠ possible',
    },
    {
      feature: 'Serialization',
      hashmap: 'manual',
      map: 'manual',
      object: 'JSON.stringify()',
    },
    {
      feature: 'Default keys',
      hashmap: 'none',
      map: 'none',
      object: 'toString, constructor, etc.',
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="font-display text-[11px] text-dim uppercase tracking-[1px] text-left py-3 pr-4" />
            <th className="font-display text-[11px] text-accent uppercase tracking-[1px] text-left py-3 px-4">
              HashMap (ours)
            </th>
            <th className="font-display text-[11px] text-blue-custom uppercase tracking-[1px] text-left py-3 px-4">
              Map
            </th>
            <th className="font-display text-[11px] text-coral uppercase tracking-[1px] text-left py-3 px-4">
              Object
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} className="border-b border-white/[0.03]">
              <td className="font-display text-[12px] text-muted py-2.5 pr-4 font-medium whitespace-nowrap">
                {row.feature}
              </td>
              <td className="text-[12px] text-muted py-2.5 px-4">
                {row.hashmap}
              </td>
              <td className="text-[12px] text-muted py-2.5 px-4">{row.map}</td>
              <td className="text-[12px] text-muted py-2.5 px-4">
                {row.object}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock() {
  return (
    <div className="bg-surface border border-white/[0.05] rounded-lg overflow-hidden mb-8">
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
        <span className="font-display text-[12px] text-muted">hashMap.ts</span>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="font-display text-[13px] leading-[1.9] text-muted whitespace-pre">
          {CODE_FINAL}
        </pre>
      </div>
    </div>
  );
}

/* ───────── main page ───────── */

const takeaways = [
  {
    icon: '🪣',
    title: "It's just an array of arrays",
    text: "Under the hood, a hash map is a fixed-size array where each slot holds a chain of [key, value] pairs. The hash function decides which slot. That's the whole data structure.",
  },
  {
    icon: '💥',
    title: 'Collisions are expected, not errors',
    text: 'Two keys landing in the same bucket is normal. Chaining (storing multiple entries per bucket) handles it gracefully. Performance only degrades when many keys collide — which signals a bad hash function.',
  },
  {
    icon: '⏱',
    title: 'O(1) is a lie (sort of)',
    text: "It's amortized O(1) — on average, each operation is constant time. But the hash function is O(k) for key length, and bucket scanning is O(n) in the pathological worst case. Real implementations use good hash functions and resizing to keep it fast.",
  },
  {
    icon: '🔀',
    title: 'No insertion order',
    text: "Classic hash maps don't preserve insertion order — iteration follows bucket indices, not the order you added entries. JavaScript's native Map maintains order by keeping a separate linked list alongside the hash table.",
  },
];

const presets: { label: string; entries: [string, string][] }[] = [
  {
    label: 'Names & ages',
    entries: [
      ['alice', '28'],
      ['bob', '34'],
      ['charlie', '22'],
      ['diana', '31'],
      ['eve', '27'],
      ['frank', '45'],
      ['grace', '29'],
    ],
  },
  {
    label: 'Force collisions',
    entries: [
      ['ab', '1'],
      ['ba', '2'],
      ['abc', '3'],
      ['cab', '4'],
      ['bac', '5'],
      ['cba', '6'],
    ],
  },
  {
    label: 'Fill it up',
    entries: [
      ['alpha', '1'],
      ['bravo', '2'],
      ['charlie', '3'],
      ['delta', '4'],
      ['echo', '5'],
      ['foxtrot', '6'],
      ['golf', '7'],
      ['hotel', '8'],
      ['india', '9'],
      ['juliet', '10'],
      ['kilo', '11'],
      ['lima', '12'],
      ['mike', '13'],
      ['november', '14'],
    ],
  },
];

export default function HashMapPage() {
  const [map, setMap] = useState(() => new HashMap<string, string>());
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [lookupInput, setLookupInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [collisionIndex, setCollisionIndex] = useState<number | null>(null);
  const [lastHashKey, setLastHashKey] = useState('');

  const addLog = useCallback((msg: string, type: LogEntry['type']) => {
    setLogs((prev) => [...prev.slice(-19), { msg, type }]);
  }, []);

  const flash = useCallback((bucket: number, isCollision: boolean) => {
    setHighlightIndex(bucket);
    setCollisionIndex(isCollision ? bucket : null);
    setTimeout(() => {
      setHighlightIndex(null);
      setCollisionIndex(null);
    }, 1200);
  }, []);

  const handleSet = useCallback(() => {
    if (!keyInput.trim()) return;
    const key = keyInput.trim();
    const value = valueInput.trim() || '—';

    const newMap = map.clone();
    const bucketIndex = newMap.hash(key);
    const isUpdate = newMap.has(key);
    const isCollision = !isUpdate && newMap.buckets[bucketIndex].length > 0;

    newMap.set(key, value);
    setMap(newMap);
    setLastHashKey(key);

    if (isUpdate) {
      addLog(
        `set("${key}", "${value}") → updated in bucket [${bucketIndex}]`,
        'set',
      );
    } else if (isCollision) {
      addLog(
        `set("${key}", "${value}") → COLLISION in bucket [${bucketIndex}]!`,
        'collision',
      );
    } else {
      addLog(`set("${key}", "${value}") → bucket [${bucketIndex}]`, 'set');
    }

    flash(bucketIndex, isCollision);
    setKeyInput('');
    setValueInput('');
  }, [keyInput, valueInput, map, addLog, flash]);

  const handleGet = useCallback(() => {
    if (!lookupInput.trim()) return;
    const key = lookupInput.trim();
    const bucketIndex = map.hash(key);
    const bucket = map.buckets[bucketIndex];
    const value = map.get(key);

    setLastHashKey(key);

    // Count steps by scanning the bucket like the real implementation does
    let stepsChecked = 0;
    for (const entry of bucket) {
      stepsChecked++;
      if (entry[0] === key) break;
    }
    if (value === undefined) stepsChecked = bucket.length;

    if (value !== undefined) {
      addLog(
        `get("${key}") → "${value}" (bucket [${bucketIndex}], ${stepsChecked} step${stepsChecked > 1 ? 's' : ''} checked)`,
        'get',
      );
    } else {
      addLog(
        `get("${key}") → undefined (bucket [${bucketIndex}] — not found)`,
        'error',
      );
    }
    flash(bucketIndex, false);
  }, [lookupInput, map, addLog, flash]);

  const handleDelete = useCallback(() => {
    if (!lookupInput.trim()) return;
    const key = lookupInput.trim();
    const bucketIndex = map.hash(key);
    const newMap = map.clone();
    const deleted = newMap.delete(key);
    setLastHashKey(key);

    if (deleted) {
      setMap(newMap);
      addLog(
        `delete("${key}") → removed from bucket [${bucketIndex}]`,
        'delete',
      );
    } else {
      addLog(`delete("${key}") → key not found`, 'error');
    }
    flash(bucketIndex, false);
  }, [lookupInput, map, addLog, flash]);

  const handlePreset = useCallback((entries: [string, string][]) => {
    const newMap = new HashMap<string, string>();
    const newLogs: LogEntry[] = [];
    entries.forEach(([k, v]) => {
      const bucketIndex = newMap.hash(k);
      const isCollision =
        !newMap.has(k) && newMap.buckets[bucketIndex].length > 0;
      newMap.set(k, v);
      newLogs.push({
        msg: `set("${k}", "${v}") → bucket [${bucketIndex}]${isCollision ? ' COLLISION' : ''}`,
        type: isCollision ? 'collision' : 'set',
      });
    });
    setMap(newMap);
    setLogs(newLogs);
    setLastHashKey('');
    setHighlightIndex(null);
    setCollisionIndex(null);
  }, []);

  const handleReset = useCallback(() => {
    setMap(new HashMap<string, string>());
    setLogs([]);
    setKeyInput('');
    setValueInput('');
    setLookupInput('');
    setLastHashKey('');
    setHighlightIndex(null);
    setCollisionIndex(null);
  }, []);

  const stats = useMemo(() => {
    const collisions = map.buckets.filter((b) => b.length > 1).length;
    const maxChain = Math.max(...map.buckets.map((b) => b.length));
    return { size: map.size, collisions, maxChain, loadFactor: map.loadFactor };
  }, [map]);

  const emptyBuckets = useMemo(
    () => map.buckets.filter((b) => b.length === 0).length,
    [map],
  );

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
              / challenges / hashmap
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="inline-block font-display text-[11px] uppercase tracking-[1.5px] text-[#4a9eff] bg-[#4a9eff]/10 px-3 py-1 rounded mb-4">
              ✦ Algo &amp; data structures
            </div>
          </Reveal>
          <Reveal delay={160}>
            <h1 className="font-display font-bold leading-[1.2] tracking-tight mb-6 text-[clamp(1.8rem,4vw,2.8rem)]">
              Building a <span className="text-accent">HashMap</span>
              <br />
              from scratch
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-[1.1rem] text-muted max-w-[580px] leading-[1.7] mb-6">
              No objects. No{' '}
              <code className="font-display text-[0.9em] bg-elevated px-1.5 py-0.5 rounded">
                Map
              </code>
              . Just an array of buckets, a hash function, and collision
              chaining. Add keys below and watch them slot into buckets in real
              time.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="flex flex-wrap gap-1.5">
              {[
                'hash tables',
                'collision chaining',
                'amortized O(1)',
                'generics',
                'data structures',
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
              Insert, lookup, and watch collisions
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              Each key gets hashed to a bucket index (0–15). When two keys land
              in the same bucket, that&apos;s a collision — they chain together.
              Try the &quot;Force collisions&quot; preset to see it clearly.
            </p>
          </Reveal>

          <Reveal delay={240}>
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Set */}
              <div className="bg-surface border border-white/[0.05] rounded-lg p-4">
                <div className="font-display text-[11px] text-accent uppercase tracking-[1px] mb-3">
                  set(key, value)
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSet()}
                    placeholder="key"
                    className="flex-1 bg-bg border border-white/[0.08] rounded-lg px-3 py-2 font-display text-[13px] text-primary placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
                  />
                  <input
                    type="text"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSet()}
                    placeholder="value"
                    className="flex-1 bg-bg border border-white/[0.08] rounded-lg px-3 py-2 font-display text-[13px] text-primary placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSet}
                  className="w-full font-display text-[12px] font-medium px-4 py-2.5 rounded-lg bg-accent text-bg transition-all duration-200 hover:bg-[#d9ff6e]"
                >
                  set()
                </button>
              </div>

              {/* Get / Delete */}
              <div className="bg-surface border border-white/[0.05] rounded-lg p-4">
                <div className="font-display text-[11px] text-blue-custom uppercase tracking-[1px] mb-3">
                  get(key) / delete(key)
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    value={lookupInput}
                    onChange={(e) => setLookupInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGet()}
                    placeholder="key to look up or delete"
                    className="w-full bg-bg border border-white/[0.08] rounded-lg px-3 py-2 font-display text-[13px] text-primary placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGet}
                    className="flex-1 font-display text-[12px] font-medium px-4 py-2.5 rounded-lg bg-elevated text-primary border border-white/[0.08] transition-all duration-200 hover:border-blue-custom hover:text-blue-custom"
                  >
                    get()
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 font-display text-[12px] font-medium px-4 py-2.5 rounded-lg bg-elevated text-primary border border-white/[0.08] transition-all duration-200 hover:border-coral hover:text-coral"
                  >
                    delete()
                  </button>
                </div>
              </div>
            </div>

            {/* Presets + Reset */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p.entries)}
                  className="font-display text-[11px] px-3.5 py-2 rounded-lg bg-elevated text-muted border border-white/[0.06] transition-all duration-200 hover:border-accent hover:text-accent"
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={handleReset}
                className="font-display text-[11px] px-3.5 py-2 rounded-lg bg-elevated text-muted border border-white/[0.06] transition-all duration-200 hover:border-coral hover:text-coral ml-auto"
              >
                ↺ Clear all
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <div className="bg-surface border border-white/[0.05] rounded-lg px-4 py-3 min-w-[110px]">
                <div className="font-display text-[10px] text-dim uppercase tracking-[1px] mb-1">
                  Entries
                </div>
                <div className="font-display text-[1.3rem] font-bold text-accent leading-none">
                  {stats.size}
                </div>
              </div>
              <div className="bg-surface border border-white/[0.05] rounded-lg px-4 py-3 min-w-[110px]">
                <div className="font-display text-[10px] text-dim uppercase tracking-[1px] mb-1">
                  Collisions
                </div>
                <div
                  className={`font-display text-[1.3rem] font-bold leading-none ${stats.collisions > 0 ? 'text-coral' : 'text-accent'}`}
                >
                  {stats.collisions}
                </div>
              </div>
              <div className="bg-surface border border-white/[0.05] rounded-lg px-4 py-3 min-w-[110px]">
                <div className="font-display text-[10px] text-dim uppercase tracking-[1px] mb-1">
                  Max chain
                </div>
                <div
                  className={`font-display text-[1.3rem] font-bold leading-none ${stats.maxChain > 2 ? 'text-coral' : 'text-muted'}`}
                >
                  {stats.maxChain}
                </div>
              </div>
              <div className="bg-surface border border-white/[0.05] rounded-lg px-4 py-3 min-w-[110px]">
                <div className="font-display text-[10px] text-dim uppercase tracking-[1px] mb-1">
                  Load factor
                </div>
                <div
                  className={`font-display text-[1.3rem] font-bold leading-none ${stats.loadFactor > 0.75 ? 'text-coral' : 'text-muted'}`}
                >
                  {stats.loadFactor.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Hash breakdown */}
            {lastHashKey && (
              <HashBreakdown
                keyStr={lastHashKey}
                bucketCount={map.bucketCount}
              />
            )}

            {/* Bucket visualizer */}
            <div className="bg-surface border border-white/[0.05] rounded-lg p-4 mb-6">
              <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-4">
                Buckets [0–{map.bucketCount - 1}] —{' '}
                {stats.size === 0
                  ? 'empty'
                  : `${stats.size} entries across ${map.bucketCount - emptyBuckets} buckets`}
              </div>
              <BucketVisualizer
                buckets={map.buckets}
                highlightIndex={highlightIndex}
                collisionIndex={collisionIndex}
              />
            </div>

            {/* Operation log */}
            {logs.length > 0 && (
              <div className="bg-surface border border-white/[0.05] rounded-lg p-4 max-h-[180px] overflow-y-auto mb-6">
                <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-2">
                  Operation log
                </div>
                {logs.map((log, i) => {
                  const cls =
                    log.type === 'collision'
                      ? 'text-coral'
                      : log.type === 'error'
                        ? 'text-dim'
                        : log.type === 'get'
                          ? 'text-blue-custom'
                          : log.type === 'delete'
                            ? 'text-yellow-400'
                            : 'text-accent';
                  return (
                    <div
                      key={i}
                      className={`font-display text-[12px] leading-[1.8] ${cls}`}
                    >
                      {log.msg}
                    </div>
                  );
                })}
              </div>
            )}
          </Reveal>
        </section>

        {/* Comparison */}
        <section className="max-w-content mx-auto px-8 mb-16 border-t border-white/[0.04] pt-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // comparison
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-2 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              HashMap vs Map vs Object
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              JavaScript gives you three key-value structures. They look similar
              but behave differently in ways that matter for interviews — and
              for production code.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="bg-surface border border-white/[0.05] rounded-lg p-5 mb-8">
              <ComparisonTable />
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="bg-elevated border-l-[3px] border-blue-custom px-5 py-4 rounded-r-lg mb-4">
              <div className="font-display text-[11px] text-blue-custom uppercase tracking-[1px] mb-1">
                💡 When to use what
              </div>
              <p className="text-[13px] text-muted leading-[1.7]">
                Use <strong className="text-primary font-medium">Object</strong>{' '}
                for simple string-keyed config or JSON data. Use{' '}
                <strong className="text-primary font-medium">Map</strong> when
                you need non-string keys, guaranteed insertion order, frequent
                additions/deletions, or when you need{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  .size
                </code>{' '}
                without counting. Use{' '}
                <strong className="text-primary font-medium">Set</strong> when
                you only care about unique keys, not values — it&apos;s
                essentially a HashMap where value is always{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  true
                </code>
                .
              </p>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="bg-elevated border-l-[3px] border-coral px-5 py-4 rounded-r-lg mb-4">
              <div className="font-display text-[11px] text-coral uppercase tracking-[1px] mb-1">
                ⚠ Interview trap
              </div>
              <p className="text-[13px] text-muted leading-[1.7]">
                &quot;Are object property lookups O(1)?&quot; — Yes, V8 uses
                hidden classes and inline caching for known shapes, making
                property access effectively constant time. But deleting
                properties with{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  delete obj.key
                </code>{' '}
                is slow because it forces a shape transition. For frequent
                add/delete patterns, use{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  Map
                </code>
                .
              </p>
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
              The full implementation
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              Generic, type-safe, with a prime-multiplier hash function and
              collision chaining. No built-in objects or Maps used internally —
              just arrays.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <CodeBlock />
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
          <span>Challenge #003</span>
        </div>
      </footer>
    </>
  );
}
