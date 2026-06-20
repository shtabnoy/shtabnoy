'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';

/* ───────── JS implementations (same algorithms, for benchmarking) ───────── */

function jsFibonacci(n: number): number {
  if (n <= 1) return n;
  return jsFibonacci(n - 1) + jsFibonacci(n - 2);
}

function jsHashDjb2(input: number): number {
  let hash = 5381;
  while (input > 0) {
    const digit = input % 10;
    hash = (hash << 5) + hash + digit;
    input = Math.floor(input / 10);
  }
  return hash >>> 0;
}

function jsCountPrimes(maxN: number): number {
  let count = 0;
  for (let n = 2; n <= maxN; n++) {
    let isPrime = true;
    for (let i = 2; i * i <= n; i++) {
      if (n % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) count++;
  }
  return count;
}

/* ───────── types ───────── */

interface WasmExports {
  fibonacci: (n: number) => number;
  hash_djb2: (n: number) => number;
  count_primes: (maxN: number) => number;
}

interface BenchmarkResult {
  name: string;
  description: string;
  jsTime: number;
  wasmTime: number;
  jsResult: number;
  wasmResult: number;
  speedup: number;
}

/* ───────── code strings ───────── */

const CODE_C = `// Pure computation — no I/O, no malloc, just numbers.

int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

unsigned int hash_djb2(unsigned int input) {
  unsigned int hash = 5381;
  while (input > 0) {
    unsigned int digit = input % 10;
    hash = ((hash << 5) + hash) + digit;
    input /= 10;
  }
  return hash;
}

// Nested loops, all computation inside WASM
int count_primes(int max_n) {
  int count = 0;
  for (int n = 2; n <= max_n; n++) {
    int is_prime = 1;
    for (int i = 2; i * i <= n; i++) {
      if (n % i == 0) { is_prime = 0; break; }
    }
    count += is_prime;
  }
  return count;
}`;

const CODE_MINIMAL = `// Raw browser API — no libraries, no glue code

const response = await fetch('/wasm/math.wasm');
const bytes = await response.arrayBuffer();
const { instance } = await WebAssembly.instantiate(bytes);

// Call C functions directly — just numbers in, numbers out
instance.exports.fibonacci(38);
instance.exports.hash_djb2(123456);
instance.exports.count_primes(100000);`;

const CODE_EMSCRIPTEN = `// Emscripten glue — convenience for complex programs

const Module = await loadEmscriptenModule('/wasm/math_full.js');

// ccall: function name, return type, arg types, args
Module.ccall('fibonacci', 'number', ['number'], [38]);
Module.ccall('hash_djb2', 'number', ['number'], [123456]);
Module.ccall('count_primes', 'number', ['number'], [100000]);`;

const CODE_DOCKER_MINIMAL = `# Minimal — produces just math.wasm
docker run --rm -v $(pwd):/src emscripten/emsdk \\
  emcc math.c -o math.wasm --no-entry \\
  -s EXPORTED_FUNCTIONS='["_fibonacci","_hash_djb2",\\
    "_count_primes"]' -O2`;

const CODE_DOCKER_FULL = `# Full — produces math_full.js + math_full.wasm
docker run --rm -v $(pwd):/src emscripten/emsdk \\
  emcc math.c -o math_full.js \\
  -s EXPORTED_FUNCTIONS='["_fibonacci","_hash_djb2",\\
    "_count_primes"]' \\
  -s EXPORTED_RUNTIME_METHODS='["ccall"]' \\
  -s MODULARIZE=1 -O2`;

/* ───────── sub-components ───────── */

function PipelineVisual() {
  const steps = [
    { label: 'math.c', sub: 'C source', color: 'text-coral' },
    { label: 'emcc', sub: 'Emscripten', color: 'text-yellow-400' },
    { label: '.wasm', sub: 'binary', color: 'text-accent' },
    { label: 'Browser', sub: 'WebAssembly API', color: 'text-blue-custom' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap py-6">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          <div className="bg-surface border border-white/[0.06] rounded-lg px-4 py-3 text-center min-w-[100px]">
            <div className={`font-display text-[14px] font-bold ${step.color}`}>
              {step.label}
            </div>
            <div className="font-display text-[10px] text-dim mt-0.5">
              {step.sub}
            </div>
          </div>
          {i < steps.length - 1 && (
            <span className="text-dim font-display text-[14px]">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

function CodePanel({
  title,
  code,
  color,
}: {
  title: string;
  code: string;
  color: string;
}) {
  return (
    <div className="bg-surface border border-white/[0.05] rounded-lg overflow-hidden">
      <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
        <span className={`font-display text-[12px] ${color}`}>{title}</span>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="font-display text-[12px] leading-[1.8] text-muted whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  );
}

function BenchmarkBar({ result }: { result: BenchmarkResult }) {
  const maxTime = Math.max(result.jsTime, result.wasmTime);
  const jsPct = maxTime > 0 ? (result.jsTime / maxTime) * 100 : 0;
  const wasmPct = maxTime > 0 ? (result.wasmTime / maxTime) * 100 : 0;

  return (
    <div className="bg-surface border border-white/[0.05] rounded-lg p-5 mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="font-display text-[13px] font-medium">
          {result.name}
        </div>
        <div
          className={`font-display text-[12px] font-bold ${result.speedup >= 1.5 ? 'text-accent' : result.speedup < 1 ? 'text-coral' : 'text-muted'}`}
        >
          {result.speedup.toFixed(1)}×{' '}
          {result.speedup >= 1 ? 'faster' : 'slower'}
        </div>
      </div>
      <div className="font-display text-[11px] text-dim mb-3">
        {result.description}
      </div>

      <div className="flex items-center gap-3 mb-2">
        <span className="font-display text-[11px] text-coral w-12">JS</span>
        <div className="flex-1 h-6 bg-bg rounded overflow-hidden">
          <div
            className="h-full rounded transition-all duration-500"
            style={{
              width: `${jsPct}%`,
              background: 'linear-gradient(90deg, #ff6b4a, #ff8f74)',
            }}
          />
        </div>
        <span className="font-display text-[11px] text-muted w-24 text-right">
          {result.jsTime.toFixed(1)}ms
        </span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <span className="font-display text-[11px] text-accent w-12">WASM</span>
        <div className="flex-1 h-6 bg-bg rounded overflow-hidden">
          <div
            className="h-full rounded transition-all duration-500"
            style={{
              width: `${wasmPct}%`,
              background: 'linear-gradient(90deg, #c8ff3e, #e0ff8a)',
            }}
          />
        </div>
        <span className="font-display text-[11px] text-muted w-24 text-right">
          {result.wasmTime.toFixed(1)}ms
        </span>
      </div>

      <div className="font-display text-[10px] text-dim mt-1">
        JS result: {result.jsResult} · WASM result: {result.wasmResult}
        {result.jsResult === result.wasmResult ? ' ✓ match' : ' ✕ mismatch!'}
      </div>
    </div>
  );
}

/* ───────── main page ───────── */

const takeaways = [
  {
    icon: '⚡',
    title: 'WASM wins on sustained computation',
    text: "Bitwise hashing and prime counting show clear speedups. WASM's pre-compiled code has no JIT warmup and no type uncertainty — it runs fast from the first instruction. The advantage grows with computation complexity.",
  },
  {
    icon: '🤝',
    title: 'V8 is remarkably good',
    text: 'For simple integer recursion like fibonacci, V8\'s JIT compiler produces nearly identical machine code. WASM isn\'t a blanket "faster than JS" — it depends on the workload.',
  },
  {
    icon: '🔌',
    title: 'JS is still the glue',
    text: "WASM can't touch the DOM, make network requests, or handle events. JavaScript orchestrates the browser; WASM accelerates the math. They're partners, not competitors.",
  },
  {
    icon: '🌍',
    title: 'Any language, same runtime',
    text: "C, C++, Rust, Go, and more all compile to the same .wasm format. The browser doesn't know or care what language produced the binary — it's just bytes.",
  },
];

export default function WasmPage() {
  const [wasmInstance, setWasmInstance] = useState<WasmExports | null>(null);
  const [emscriptenInstance, setEmscriptenInstance] = useState<any>(null);
  const [loadStatus, setLoadStatus] = useState<
    'idle' | 'loading' | 'loaded' | 'error'
  >('idle');
  const [emscriptenStatus, setEmscriptenStatus] = useState<
    'idle' | 'loading' | 'loaded' | 'error'
  >('idle');
  const [benchResults, setBenchResults] = useState<BenchmarkResult[]>([]);
  const [benchRunning, setBenchRunning] = useState(false);
  const [fibN, setFibN] = useState(38);

  const [minimalTest, setMinimalTest] = useState<string | null>(null);
  const [emscriptenTest, setEmscriptenTest] = useState<string | null>(null);

  const loadMinimal = useCallback(async () => {
    setLoadStatus('loading');
    try {
      const response = await fetch('/wasm/math.wasm');
      const bytes = await response.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(bytes);
      const exports = instance.exports as unknown as WasmExports;
      setWasmInstance(exports);
      setLoadStatus('loaded');
    } catch (e) {
      setLoadStatus('error');
      console.error('Failed to load WASM:', e);
    }
  }, []);

  const loadEmscripten = useCallback(async () => {
    setEmscriptenStatus('loading');
    try {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/wasm/math_full.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load script'));
        document.head.appendChild(script);
      });
      const mod = await (window as any).Module();
      setEmscriptenInstance(mod);
      setEmscriptenStatus('loaded');
    } catch (e) {
      setEmscriptenStatus('error');
      console.error('Failed to load Emscripten:', e);
    }
  }, []);

  const testMinimal = useCallback(() => {
    if (!wasmInstance) return;
    const fib = wasmInstance.fibonacci(10);
    const hash = wasmInstance.hash_djb2(123456);
    const primes = wasmInstance.count_primes(1000);
    setMinimalTest(
      `fibonacci(10) = ${fib}, hash(123456) = ${hash}, primes under 1000 = ${primes}`,
    );
  }, [wasmInstance]);

  const testEmscripten = useCallback(() => {
    if (!emscriptenInstance) return;
    const fib = emscriptenInstance.ccall(
      'fibonacci',
      'number',
      ['number'],
      [10],
    );
    const hash = emscriptenInstance.ccall(
      'hash_djb2',
      'number',
      ['number'],
      [123456],
    );
    const primes = emscriptenInstance.ccall(
      'count_primes',
      'number',
      ['number'],
      [1000],
    );
    setEmscriptenTest(
      `fibonacci(10) = ${fib}, hash(123456) = ${hash}, primes under 1000 = ${primes}`,
    );
  }, [emscriptenInstance]);

  const runBenchmarks = useCallback(() => {
    if (!wasmInstance || benchRunning) return;
    setBenchRunning(true);
    setBenchResults([]);

    setTimeout(() => {
      const results: BenchmarkResult[] = [];

      // 1. Fibonacci
      const fibJsStart = performance.now();
      const fibJsResult = jsFibonacci(fibN);
      const fibJsTime = performance.now() - fibJsStart;

      const fibWasmStart = performance.now();
      const fibWasmResult = wasmInstance.fibonacci(fibN);
      const fibWasmTime = performance.now() - fibWasmStart;

      results.push({
        name: `fibonacci(${fibN})`,
        description: `Naive recursive O(2ⁿ) — simple integer math, V8 optimizes this well`,
        jsTime: fibJsTime,
        wasmTime: fibWasmTime,
        jsResult: fibJsResult,
        wasmResult: fibWasmResult,
        speedup: fibJsTime / fibWasmTime,
      });

      // 2. Hash — 1M iterations
      const hashIterations = 1_000_000;

      const hashJsStart = performance.now();
      let hashJsResult = 0;
      for (let i = 0; i < hashIterations; i++) {
        hashJsResult = jsHashDjb2(i);
      }
      const hashJsTime = performance.now() - hashJsStart;

      const hashWasmStart = performance.now();
      let hashWasmResult = 0;
      for (let i = 0; i < hashIterations; i++) {
        hashWasmResult = wasmInstance.hash_djb2(i);
      }
      const hashWasmTime = performance.now() - hashWasmStart;

      results.push({
        name: `hash_djb2 × ${(hashIterations / 1_000_000).toFixed(0)}M`,
        description: `DJB2 hash called 1M times — bitwise ops and tight loops`,
        jsTime: hashJsTime,
        wasmTime: hashWasmTime,
        jsResult: hashJsResult,
        wasmResult: hashWasmResult,
        speedup: hashJsTime / hashWasmTime,
      });

      // 3. Count primes
      const primeMax = 500_000;

      const primeJsStart = performance.now();
      const primeJsResult = jsCountPrimes(primeMax);
      const primeJsTime = performance.now() - primeJsStart;

      const primeWasmStart = performance.now();
      const primeWasmResult = wasmInstance.count_primes(primeMax);
      const primeWasmTime = performance.now() - primeWasmStart;

      results.push({
        name: `count_primes(${primeMax.toLocaleString()})`,
        description: `Trial division with nested loops — single WASM call, no boundary overhead`,
        jsTime: primeJsTime,
        wasmTime: primeWasmTime,
        jsResult: primeJsResult,
        wasmResult: primeWasmResult,
        speedup: primeJsTime / primeWasmTime,
      });

      setBenchResults(results);
      setBenchRunning(false);
    }, 50);
  }, [wasmInstance, benchRunning, fibN]);

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
              / challenges / wasm
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="inline-block font-display text-[11px] uppercase tracking-[1.5px] text-[#ff9f43] bg-[#ff9f43]/10 px-3 py-1 rounded mb-4">
              ✦ Browser internals
            </div>
          </Reveal>
          <Reveal delay={160}>
            <h1 className="font-display font-bold leading-[1.2] tracking-tight mb-6 text-[clamp(1.8rem,4vw,2.8rem)]">
              C → <span className="text-accent">WebAssembly</span>
              <br />
              in the browser
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-[1.1rem] text-muted max-w-[580px] leading-[1.7] mb-6">
              Write functions in C, compile them to WASM, and race them against
              JavaScript. Same algorithms, same browser — see where compiled C
              pulls ahead and where V8&apos;s JIT keeps up.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="flex flex-wrap gap-1.5">
              {['WebAssembly', 'C', 'Emscripten', 'Docker', 'benchmarking'].map(
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

        {/* Pipeline */}
        <section className="max-w-content mx-auto px-8 mb-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // the pipeline
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-2 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              From C source to browser execution
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-4 max-w-[600px]">
              C code compiled to a{' '}
              <code className="font-display text-[0.9em] bg-elevated px-1.5 py-0.5 rounded">
                .wasm
              </code>{' '}
              binary — a compact, pre-compiled format the browser executes at
              near-native speed.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <PipelineVisual />
          </Reveal>
          <Reveal delay={320}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <CodePanel
                title="Minimal compile (just .wasm)"
                code={CODE_DOCKER_MINIMAL}
                color="text-accent"
              />
              <CodePanel
                title="Emscripten compile (.js + .wasm)"
                code={CODE_DOCKER_FULL}
                color="text-yellow-400"
              />
            </div>
          </Reveal>
        </section>

        {/* Two loading approaches */}
        <section className="max-w-content mx-auto px-8 mb-16 border-t border-white/[0.04] pt-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // loading
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-2 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              Two ways to load WASM
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              The raw browser API is 3 lines. Emscripten adds a JS loader for
              convenience. Both run the same compiled binary — try them both.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Minimal */}
              <div>
                <CodePanel
                  title="Minimal — raw WebAssembly API"
                  code={CODE_MINIMAL}
                  color="text-accent"
                />
                <div className="mt-3 bg-surface border border-white/[0.05] rounded-lg p-4">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={loadMinimal}
                      disabled={loadStatus === 'loaded'}
                      className="font-display text-[11px] font-medium px-4 py-2 rounded-lg bg-accent text-bg transition-all duration-200 hover:bg-[#d9ff6e] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loadStatus === 'loaded'
                        ? '✓ Loaded'
                        : loadStatus === 'loading'
                          ? 'Loading...'
                          : 'Load .wasm'}
                    </button>
                    {loadStatus === 'loaded' && (
                      <button
                        onClick={testMinimal}
                        className="font-display text-[11px] font-medium px-4 py-2 rounded-lg bg-elevated text-primary border border-white/[0.08] transition-all duration-200 hover:border-accent"
                      >
                        Test it
                      </button>
                    )}
                  </div>
                  {loadStatus === 'error' && (
                    <div className="font-display text-[11px] text-coral">
                      Failed — check public/wasm/math.wasm
                    </div>
                  )}
                  {minimalTest && (
                    <div className="font-display text-[11px] text-accent leading-[1.8]">
                      {minimalTest}
                    </div>
                  )}
                </div>
              </div>

              {/* Emscripten */}
              <div>
                <CodePanel
                  title="Emscripten — ccall convenience"
                  code={CODE_EMSCRIPTEN}
                  color="text-yellow-400"
                />
                <div className="mt-3 bg-surface border border-white/[0.05] rounded-lg p-4">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={loadEmscripten}
                      disabled={emscriptenStatus === 'loaded'}
                      className="font-display text-[11px] font-medium px-4 py-2 rounded-lg bg-yellow-400 text-bg transition-all duration-200 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {emscriptenStatus === 'loaded'
                        ? '✓ Loaded'
                        : emscriptenStatus === 'loading'
                          ? 'Loading...'
                          : 'Load glue + .wasm'}
                    </button>
                    {emscriptenStatus === 'loaded' && (
                      <button
                        onClick={testEmscripten}
                        className="font-display text-[11px] font-medium px-4 py-2 rounded-lg bg-elevated text-primary border border-white/[0.08] transition-all duration-200 hover:border-yellow-400"
                      >
                        Test it
                      </button>
                    )}
                  </div>
                  {emscriptenStatus === 'error' && (
                    <div className="font-display text-[11px] text-coral">
                      Failed — check public/wasm/math_full.js
                    </div>
                  )}
                  {emscriptenTest && (
                    <div className="font-display text-[11px] text-yellow-400 leading-[1.8]">
                      {emscriptenTest}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="bg-elevated border-l-[3px] border-accent px-5 py-4 rounded-r-lg">
              <div className="font-display text-[11px] text-accent uppercase tracking-[1px] mb-1">
                💡 When to use which
              </div>
              <p className="text-[13px] text-muted leading-[1.7]">
                <strong className="text-primary font-medium">Minimal</strong>{' '}
                for pure number crunching — smaller, no dependencies.{' '}
                <strong className="text-primary font-medium">Emscripten</strong>{' '}
                when your C code needs strings, arrays, file I/O, or{' '}
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  malloc
                </code>{' '}
                — the glue emulates all the system interfaces C expects.
              </p>
            </div>
          </Reveal>
        </section>

        {/* Benchmark */}
        <section className="max-w-content mx-auto px-8 mb-16 border-t border-white/[0.04] pt-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // benchmark
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-2 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              WASM vs JavaScript — same algorithm, same browser
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              Three algorithms implemented identically in C and JavaScript.
              Fibonacci tests simple recursion. Hashing tests bitwise ops in
              tight loops. Prime counting tests sustained nested integer
              computation — all inside a single WASM call.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex gap-3 mb-6 items-end flex-wrap">
              {loadStatus !== 'loaded' ? (
                <button
                  onClick={loadMinimal}
                  className="font-display text-[12px] font-medium px-5 py-2.5 rounded-lg bg-accent text-bg transition-all duration-200 hover:bg-[#d9ff6e]"
                >
                  Load WASM first
                </button>
              ) : (
                <button
                  onClick={runBenchmarks}
                  disabled={benchRunning}
                  className="font-display text-[12px] font-medium px-5 py-2.5 rounded-lg bg-accent text-bg transition-all duration-200 hover:bg-[#d9ff6e] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {benchRunning ? 'Running...' : '▶ Run benchmark'}
                </button>
              )}
              <div className="flex items-center gap-2">
                <label className="font-display text-[11px] text-dim">
                  fibonacci N:
                </label>
                <select
                  value={fibN}
                  onChange={(e) => setFibN(Number(e.target.value))}
                  className="bg-surface border border-white/[0.08] rounded-lg px-3 py-2 font-display text-[12px] text-primary focus:outline-none focus:border-accent/40 appearance-none cursor-pointer"
                >
                  <option value={30}>30 (fast)</option>
                  <option value={35}>35 (medium)</option>
                  <option value={38}>38 (slow)</option>
                  <option value={40}>40 (very slow)</option>
                  <option value={42}>42 (grab coffee)</option>
                </select>
              </div>
            </div>

            {benchResults.length > 0 ? (
              <div>
                {benchResults.map((result) => (
                  <BenchmarkBar key={result.name} result={result} />
                ))}
              </div>
            ) : loadStatus === 'loaded' ? (
              <div className="bg-surface border border-white/[0.05] rounded-lg p-8 text-center">
                <div className="font-display text-[13px] text-dim">
                  Press &quot;Run benchmark&quot; to race WASM against
                  JavaScript
                </div>
              </div>
            ) : null}
          </Reveal>

          {benchResults.length > 0 && (
            <Reveal delay={320}>
              <div className="bg-elevated border-l-[3px] border-accent px-5 py-4 rounded-r-lg mt-6">
                <div className="font-display text-[11px] text-accent uppercase tracking-[1px] mb-1">
                  💡 What the results mean
                </div>
                <p className="text-[13px] text-muted leading-[1.7]">
                  WASM isn&apos;t a blanket &quot;faster than JS.&quot;
                  V8&apos;s TurboFan JIT is remarkably good at optimizing hot
                  integer code (fibonacci). But for bitwise operations (hashing)
                  and computation-heavy inner loops (primes), WASM&apos;s
                  pre-compiled machine code runs without JIT warmup or type
                  speculation overhead. Real-world WASM use cases — Figma,
                  Photoshop, game engines — involve sustained computation that
                  stays inside WASM.
                </p>
              </div>
            </Reveal>
          )}
        </section>

        {/* C source */}
        <section className="max-w-content mx-auto px-8 mb-16 border-t border-white/[0.04] pt-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // the code
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-2 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              The C source
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              Pure computation. No{' '}
              <code className="font-display text-[0.9em] bg-elevated px-1.5 py-0.5 rounded">
                #include
              </code>
              , no{' '}
              <code className="font-display text-[0.9em] bg-elevated px-1.5 py-0.5 rounded">
                main()
              </code>
              , no I/O. Just functions that take numbers and return numbers.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <CodePanel title="math.c" code={CODE_C} color="text-coral" />
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

      <footer className="py-8 border-t border-white/[0.04]">
        <div className="max-w-content mx-auto px-8 flex justify-between items-center font-display text-[11px] text-dim">
          <span>
            Built by{' '}
            <Link href="/" className="text-accent hover:underline">
              Denis Shtabnoy
            </Link>
          </span>
          <span>Challenge #005</span>
        </div>
      </footer>
    </>
  );
}
