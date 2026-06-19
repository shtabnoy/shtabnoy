'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { LinkedList } from '@/utils/linkedList';

/* ───────── code string ───────── */
const CODE_FINAL = `type ListNode<T> = {
  value: T;
  next: ListNode<T> | null;
};

class LinkedList<T> {
  private _head: ListNode<T> | null = null;
  private _size: number = 0;

  append(value: T) {
    const newNode = { value, next: null };
    let node = this._head;
    while (node?.next) { node = node.next; }
    if (node) { node.next = newNode; }
    else { this._head = newNode; }
    this._size++;
  }

  prepend(value: T) {
    this._head = { value, next: this._head };
    this._size++;
  }

  deleteByValue(value: T): boolean {
    if (this._head?.value === value) {
      this._head = this._head.next;
      this._size--;
      return true;
    }
    let node = this._head;
    while (node) {
      if (node.next?.value === value) {
        node.next = node.next.next;
        this._size--;
        return true;
      }
      node = node.next;
    }
    return false;
  }

  insertAt(index: number, value: T): boolean {
    if (index >= this._size) return false;
    if (index === 0) { this.prepend(value); return true; }
    let node = this._head;
    for (let i = 0; i < index - 1; i++) { node = node!.next; }
    node!.next = { value, next: node!.next };
    this._size++;
    return true;
  }

  reverse() {
    let prev = null;
    let node = this._head;
    while (node) {
      const next = node.next;   // save next
      node.next = prev;         // reverse pointer
      prev = node;              // advance prev
      node = next;              // advance node
    }
    this._head = prev;
  }
}`;

/* ───────── types ───────── */
interface LogEntry {
  msg: string;
  type: 'add' | 'delete' | 'reverse' | 'info' | 'error';
}

/* ───────── Reversal step-through types ───────── */
interface ReversalNode {
  id: string; // fake memory address
  value: string;
  nextId: string | null;
}

interface ReversalStep {
  nodes: ReversalNode[];
  prev: string | null;
  node: string | null;
  nextVar: string | null;
  codeLine: number;
  description: string;
}

function buildReversalSteps(values: string[]): ReversalStep[] {
  if (values.length === 0) return [];

  // Assign fake addresses
  const ids = values.map((_, i) => `0x${(0xa0 + i * 0x10).toString(16)}`);

  // Build initial nodes
  const makeNodes = (nexts: (string | null)[]): ReversalNode[] =>
    values.map((v, i) => ({ id: ids[i], value: v, nextId: nexts[i] }));

  const initialNexts = values.map((_, i) =>
    i < values.length - 1 ? ids[i + 1] : null,
  );

  const steps: ReversalStep[] = [];

  // Initial state
  steps.push({
    nodes: makeNodes(initialNexts),
    prev: null,
    node: ids[0],
    nextVar: null,
    codeLine: 0,
    description: `Start: prev = null, node = head (${ids[0]})`,
  });

  // Simulate reversal
  const nexts = [...initialNexts];
  let prevId: string | null = null;
  let nodeIdx = 0;

  while (nodeIdx < values.length) {
    const currentId = ids[nodeIdx];
    const savedNextId = nexts[nodeIdx];
    const savedNextIdx = savedNextId ? ids.indexOf(savedNextId) : -1;

    // Line 1: const next = node.next
    steps.push({
      nodes: makeNodes(nexts),
      prev: prevId,
      node: currentId,
      nextVar: savedNextId,
      codeLine: 1,
      description: `Save next: nextVar = node.next → ${savedNextId ?? 'null'}`,
    });

    // Line 2: node.next = prev
    const newNexts = [...nexts];
    newNexts[nodeIdx] = prevId;
    steps.push({
      nodes: makeNodes(newNexts),
      prev: prevId,
      node: currentId,
      nextVar: savedNextId,
      codeLine: 2,
      description: `Reverse: node.next = prev → ${prevId ?? 'null'} (address copied, not a live link)`,
    });

    // Line 3: prev = node
    const newPrevId = currentId;
    steps.push({
      nodes: makeNodes(newNexts),
      prev: newPrevId,
      node: currentId,
      nextVar: savedNextId,
      codeLine: 3,
      description: `Advance: prev = node → ${newPrevId} (prev now holds ${newPrevId}, doesn't change node.next)`,
    });

    // Line 4: node = next
    prevId = newPrevId;
    nexts[nodeIdx] = newNexts[nodeIdx];
    const newNodeId = savedNextId;
    nodeIdx = savedNextIdx >= 0 ? savedNextIdx : values.length;

    steps.push({
      nodes: makeNodes(nexts),
      prev: prevId,
      node: newNodeId,
      nextVar: savedNextId,
      codeLine: 4,
      description: newNodeId
        ? `Advance: node = next → ${newNodeId} (both node and next now hold the same address)`
        : `node = null — loop ends. head = prev (${prevId})`,
    });
  }

  return steps;
}

/* ───────── sub-components ───────── */

function ChainVisualizer({
  values,
  highlightIndex,
}: {
  values: (string | number)[];
  highlightIndex?: number | null;
}) {
  if (values.length === 0) {
    return (
      <div className="flex items-center gap-2 py-6">
        <span className="font-display text-[11px] text-accent uppercase tracking-[1px]">
          head
        </span>
        <span className="text-dim">→</span>
        <span className="font-display text-[13px] text-dim">null</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 flex-wrap py-4">
      <span className="font-display text-[11px] text-accent uppercase tracking-[1px] mr-2">
        head
      </span>
      <span className="text-dim mr-1">→</span>
      {values.map((v, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`font-display text-[14px] font-bold px-4 py-2 rounded-lg border transition-all duration-300 ${
              highlightIndex === i
                ? 'bg-accent/10 border-accent text-accent'
                : 'bg-surface border-white/[0.08] text-primary'
            }`}
          >
            {String(v)}
          </div>
          <span className="text-dim mx-1">→</span>
        </div>
      ))}
      <span className="font-display text-[13px] text-dim">null</span>
    </div>
  );
}

function ReversalStepper({ values }: { values: string[] }) {
  const steps = useMemo(() => buildReversalSteps(values), [values]);
  const [stepIndex, setStepIndex] = useState(0);

  const step = steps[stepIndex];
  if (!step) return null;

  const codeLines = [
    'let prev = null, node = head;',
    'const next = node.next;     // save',
    'node.next = prev;           // reverse',
    'prev = node;                // advance prev',
    'node = next;                // advance node',
  ];

  return (
    <div>
      {/* Controls */}
      <div className="flex gap-2 mb-4 items-center">
        <button
          onClick={() => setStepIndex(0)}
          disabled={stepIndex === 0}
          className="font-display text-[11px] px-3 py-2 rounded-lg bg-elevated text-muted border border-white/[0.06] transition-all duration-200 hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ⏮ Start
        </button>
        <button
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="font-display text-[11px] px-3 py-2 rounded-lg bg-elevated text-muted border border-white/[0.06] transition-all duration-200 hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <button
          onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
          disabled={stepIndex === steps.length - 1}
          className="font-display text-[12px] font-medium px-5 py-2 rounded-lg bg-accent text-bg transition-all duration-200 hover:bg-[#d9ff6e] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
        <span className="font-display text-[11px] text-dim ml-auto">
          Step {stepIndex + 1} / {steps.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nodes visualization */}
        <div className="bg-surface border border-white/[0.05] rounded-lg p-4">
          <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-3">
            Memory
          </div>
          <div className="space-y-2">
            {step.nodes.map((n) => {
              const isPrev = step.prev === n.id;
              const isNode = step.node === n.id;
              const isNext = step.nextVar === n.id;

              const labels: string[] = [];
              if (isPrev) labels.push('prev');
              if (isNode) labels.push('node');
              if (isNext) labels.push('next');

              const borderColor = isNode
                ? 'border-accent'
                : isPrev
                  ? 'border-coral'
                  : isNext
                    ? 'border-blue-custom'
                    : 'border-white/[0.06]';

              return (
                <div
                  key={n.id}
                  className={`flex items-center gap-3 bg-bg rounded-lg px-3 py-2 border ${borderColor} transition-all duration-300`}
                >
                  <span className="font-display text-[10px] text-dim w-10 flex-shrink-0">
                    {n.id}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-display text-[13px] font-bold text-primary w-6 text-center">
                      {n.value}
                    </span>
                    <span className="text-dim text-[10px]">.next →</span>
                    <span className="font-display text-[11px] text-muted">
                      {n.nextId ?? 'null'}
                    </span>
                  </div>
                  {labels.length > 0 && (
                    <div className="flex gap-1">
                      {labels.map((l) => (
                        <span
                          key={l}
                          className={`font-display text-[9px] uppercase tracking-[0.5px] px-1.5 py-0.5 rounded ${
                            l === 'prev'
                              ? 'bg-coral/15 text-coral'
                              : l === 'node'
                                ? 'bg-accent/15 text-accent'
                                : 'bg-blue-custom/15 text-blue-custom'
                          }`}
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Variable state */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-elevated rounded px-2 py-1.5 text-center">
              <div className="font-display text-[9px] text-coral uppercase tracking-[0.5px]">
                prev
              </div>
              <div className="font-display text-[12px] text-primary font-bold">
                {step.prev ?? 'null'}
              </div>
            </div>
            <div className="bg-elevated rounded px-2 py-1.5 text-center">
              <div className="font-display text-[9px] text-accent uppercase tracking-[0.5px]">
                node
              </div>
              <div className="font-display text-[12px] text-primary font-bold">
                {step.node ?? 'null'}
              </div>
            </div>
            <div className="bg-elevated rounded px-2 py-1.5 text-center">
              <div className="font-display text-[9px] text-blue-custom uppercase tracking-[0.5px]">
                next
              </div>
              <div className="font-display text-[12px] text-primary font-bold">
                {step.nextVar ?? '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Code + description */}
        <div className="bg-surface border border-white/[0.05] rounded-lg p-4">
          <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-3">
            Code
          </div>
          <div className="space-y-0.5 mb-4">
            {codeLines.map((line, i) => (
              <div
                key={i}
                className={`font-display text-[12px] px-3 py-1 rounded transition-all duration-200 ${
                  step.codeLine === i ? 'bg-accent/10 text-accent' : 'text-dim'
                }`}
              >
                {line}
              </div>
            ))}
          </div>
          <div className="bg-elevated rounded-lg px-3 py-2.5">
            <div className="font-display text-[11px] text-accent mb-1">
              What just happened:
            </div>
            <div className="text-[12px] text-muted leading-[1.7]">
              {step.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PointerExplainer() {
  const [step, setStep] = useState(0);

  const states = [
    {
      a: '0xA0',
      b: 'null',
      nodeNext: 'null',
      objects: [{ addr: '0xA0', label: '{value: 1}' }],
      code: 'let a = {value: 1};    // a holds 0xA0',
      explain:
        'Variable "a" stores the address 0xA0 — where the object lives in memory. It doesn\'t hold the object itself, just the address.',
    },
    {
      a: '0xA0',
      b: '0xA0',
      nodeNext: 'null',
      objects: [{ addr: '0xA0', label: '{value: 1}' }],
      code: 'let b = a;             // b gets copy of 0xA0',
      explain:
        'The address 0xA0 is copied from "a" into "b". Now both variables point to the same object. But they\'re independent copies of the same address.',
    },
    {
      a: '0xF0',
      b: '0xA0',
      nodeNext: 'null',
      objects: [
        { addr: '0xA0', label: '{value: 1}' },
        { addr: '0xF0', label: '{value: 2}' },
      ],
      code: 'a = {value: 2};        // a now holds NEW addr 0xF0',
      explain:
        'Reassigning "a" creates a new object at 0xF0 and stores that address in "a". Variable "b" is unaffected — it still holds 0xA0. Reassignment copies an address, it doesn\'t create a live link.',
    },
  ];

  const s = states[step];

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {states.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`font-display text-[11px] px-3 py-2 rounded-lg border transition-all duration-200 ${
              step === i
                ? 'bg-accent/10 border-accent text-accent'
                : 'bg-elevated border-white/[0.06] text-muted hover:border-accent'
            }`}
          >
            Step {i + 1}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-white/[0.05] rounded-lg p-4">
          {/* Variables */}
          <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-3">
            Variables (hold addresses)
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-3 bg-bg rounded-lg px-3 py-2 border border-accent/30">
              <span className="font-display text-[13px] font-bold text-accent w-6">
                a
              </span>
              <span className="text-dim text-[10px]">=</span>
              <span className="font-display text-[13px] text-primary font-bold">
                {s.a}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-bg rounded-lg px-3 py-2 border border-coral/30">
              <span className="font-display text-[13px] font-bold text-coral w-6">
                b
              </span>
              <span className="text-dim text-[10px]">=</span>
              <span className="font-display text-[13px] text-primary font-bold">
                {s.b}
              </span>
            </div>
          </div>

          {/* Heap */}
          <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-3">
            Memory (objects live here)
          </div>
          <div className="space-y-2">
            {s.objects.map((obj) => {
              const pointedBy: string[] = [];
              if (s.a === obj.addr) pointedBy.push('a');
              if (s.b === obj.addr) pointedBy.push('b');

              return (
                <div
                  key={obj.addr}
                  className="flex items-center gap-3 bg-bg rounded-lg px-3 py-2 border border-white/[0.06]"
                >
                  <span className="font-display text-[10px] text-dim w-10">
                    {obj.addr}
                  </span>
                  <span className="font-display text-[12px] text-primary">
                    {obj.label}
                  </span>
                  {pointedBy.length > 0 && (
                    <span className="font-display text-[10px] text-dim ml-auto">
                      ← {pointedBy.join(', ')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface border border-white/[0.05] rounded-lg p-4">
          <div className="font-display text-[11px] text-dim uppercase tracking-[1px] mb-3">
            Code
          </div>
          <div className="bg-accent/10 rounded-lg px-3 py-2 mb-4">
            <pre className="font-display text-[12px] text-accent">{s.code}</pre>
          </div>
          <div className="text-[13px] text-muted leading-[1.7]">
            {s.explain}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeBlock() {
  return (
    <div className="bg-surface border border-white/[0.05] rounded-lg overflow-hidden mb-8">
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
        <span className="font-display text-[12px] text-muted">
          linkedList.ts
        </span>
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
    icon: '🔗',
    title: 'Nodes + pointers = list',
    text: 'A linked list is just objects pointing to other objects. No array, no indices. Traversal is always O(n) because you have to walk from head to find anything.',
  },
  {
    icon: '⚡',
    title: 'O(1) insert at head',
    text: "Prepending is instant — create a node, point it to the old head, done. No shifting elements like an array. That's the linked list's killer feature.",
  },
  {
    icon: '🔄',
    title: 'Reversal = pointer juggling',
    text: "Reversing in place requires three variables (prev, node, next) and careful sequencing. It's the most common interview question because it tests pointer manipulation under pressure.",
  },
  {
    icon: '📍',
    title: 'Assignment copies addresses',
    text: "When you write a = b, you copy the address b holds into a. They're independent snapshots. Reassigning one doesn't affect the other. This is how all reference types work in JS.",
  },
];

export default function LinkedListPage() {
  const [list, setList] = useState(() => new LinkedList<string>());
  const [input, setInput] = useState('');
  const [insertIndex, setInsertIndex] = useState('');
  const [insertValue, setInsertValue] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  const values = useMemo(() => list.toArray(), [list]);

  const addLog = useCallback((msg: string, type: LogEntry['type']) => {
    setLogs((prev) => [...prev.slice(-14), { msg, type }]);
  }, []);

  const flash = useCallback((index: number) => {
    setHighlightIndex(index);
    setTimeout(() => setHighlightIndex(null), 800);
  }, []);

  const handleAppend = useCallback(() => {
    if (!input.trim()) return;
    const newList = list.clone();
    newList.append(input.trim());
    setList(newList);
    addLog(`append("${input.trim()}") → added to end`, 'add');
    flash(newList.size - 1);
    setInput('');
  }, [input, list, addLog, flash]);

  const handlePrepend = useCallback(() => {
    if (!input.trim()) return;
    const newList = list.clone();
    newList.prepend(input.trim());
    setList(newList);
    addLog(`prepend("${input.trim()}") → new head`, 'add');
    flash(0);
    setInput('');
  }, [input, list, addLog, flash]);

  const handleDelete = useCallback(() => {
    if (!input.trim()) return;
    const newList = list.clone();
    const deleted = newList.deleteByValue(input.trim());
    if (deleted) {
      setList(newList);
      addLog(`delete("${input.trim()}") → removed`, 'delete');
    } else {
      addLog(`delete("${input.trim()}") → not found`, 'error');
    }
    setInput('');
  }, [input, list, addLog]);

  const handleInsertAt = useCallback(() => {
    if (!insertValue.trim() || insertIndex === '') return;
    const idx = parseInt(insertIndex, 10);
    if (isNaN(idx)) return;
    const newList = list.clone();
    const inserted = newList.insertAt(idx, insertValue.trim());
    if (inserted) {
      setList(newList);
      addLog(`insertAt(${idx}, "${insertValue.trim()}") → inserted`, 'add');
      flash(idx);
    } else {
      addLog(
        `insertAt(${idx}, "${insertValue.trim()}") → index out of bounds`,
        'error',
      );
    }
    setInsertValue('');
    setInsertIndex('');
  }, [insertIndex, insertValue, list, addLog, flash]);

  const handleReverse = useCallback(() => {
    if (list.size === 0) return;
    const newList = list.clone();
    newList.reverse();
    setList(newList);
    addLog(`reverse() → [${newList.toArray().join(', ')}]`, 'reverse');
  }, [list, addLog]);

  const handleReset = useCallback(() => {
    setList(new LinkedList<string>());
    setLogs([]);
    setInput('');
    setInsertIndex('');
    setInsertValue('');
    setHighlightIndex(null);
  }, []);

  const handlePreset = useCallback(() => {
    const newList = new LinkedList<string>();
    ['A', 'B', 'C', 'D'].forEach((v) => newList.append(v));
    setList(newList);
    setLogs([{ msg: 'Loaded: A → B → C → D', type: 'info' }]);
  }, []);

  // Values for reversal stepper — use a fixed simple example
  const reversalValues = useMemo(() => ['1', '2', '3'], []);

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
              / challenges / linked-list
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="inline-block font-display text-[11px] uppercase tracking-[1.5px] text-[#4a9eff] bg-[#4a9eff]/10 px-3 py-1 rounded mb-4">
              ✦ Algo &amp; data structures
            </div>
          </Reveal>
          <Reveal delay={160}>
            <h1 className="font-display font-bold leading-[1.2] tracking-tight mb-6 text-[clamp(1.8rem,4vw,2.8rem)]">
              Building a <span className="text-accent">Linked List</span>
              <br />
              from scratch
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-[1.1rem] text-muted max-w-[580px] leading-[1.7] mb-6">
              Nodes pointing to nodes. No arrays, no indices — just pointers.
              Append, prepend, delete, insert, and reverse a list by rewiring
              references. Then step through reversal one pointer at a time.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="flex flex-wrap gap-1.5">
              {[
                'linked list',
                'pointers',
                'reversal',
                'references',
                'O(1) prepend',
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
              Build and manipulate a list
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              Add nodes, remove them, insert at any position, or reverse the
              whole chain. Watch the pointers rewire in real time.
            </p>
          </Reveal>

          <Reveal delay={240}>
            {/* Chain visualization */}
            <div className="bg-surface border border-white/[0.05] rounded-lg px-5 py-2 mb-6 overflow-x-auto">
              <ChainVisualizer
                values={values}
                highlightIndex={highlightIndex}
              />
              <div className="font-display text-[11px] text-dim pb-2">
                Size: {list.size}
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Append / Prepend / Delete */}
              <div className="bg-surface border border-white/[0.05] rounded-lg p-4">
                <div className="font-display text-[11px] text-accent uppercase tracking-[1px] mb-3">
                  append / prepend / delete
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAppend()}
                  placeholder="value"
                  className="w-full bg-bg border border-white/[0.08] rounded-lg px-3 py-2 font-display text-[13px] text-primary placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAppend}
                    className="flex-1 font-display text-[11px] font-medium px-3 py-2.5 rounded-lg bg-accent text-bg transition-all duration-200 hover:bg-[#d9ff6e]"
                  >
                    append
                  </button>
                  <button
                    onClick={handlePrepend}
                    className="flex-1 font-display text-[11px] font-medium px-3 py-2.5 rounded-lg bg-elevated text-primary border border-white/[0.08] transition-all duration-200 hover:border-accent hover:text-accent"
                  >
                    prepend
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 font-display text-[11px] font-medium px-3 py-2.5 rounded-lg bg-elevated text-primary border border-white/[0.08] transition-all duration-200 hover:border-coral hover:text-coral"
                  >
                    delete
                  </button>
                </div>
              </div>

              {/* InsertAt */}
              <div className="bg-surface border border-white/[0.05] rounded-lg p-4">
                <div className="font-display text-[11px] text-blue-custom uppercase tracking-[1px] mb-3">
                  insertAt(index, value)
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={insertIndex}
                    onChange={(e) => setInsertIndex(e.target.value)}
                    placeholder="index"
                    min="0"
                    className="w-20 bg-bg border border-white/[0.08] rounded-lg px-3 py-2 font-display text-[13px] text-primary placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
                  />
                  <input
                    type="text"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInsertAt()}
                    placeholder="value"
                    className="flex-1 bg-bg border border-white/[0.08] rounded-lg px-3 py-2 font-display text-[13px] text-primary placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
                <button
                  onClick={handleInsertAt}
                  className="w-full font-display text-[11px] font-medium px-3 py-2.5 rounded-lg bg-elevated text-primary border border-white/[0.08] transition-all duration-200 hover:border-blue-custom hover:text-blue-custom"
                >
                  insertAt
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={handlePreset}
                className="font-display text-[11px] px-3.5 py-2 rounded-lg bg-elevated text-muted border border-white/[0.06] transition-all duration-200 hover:border-accent hover:text-accent"
              >
                Load A→B→C→D
              </button>
              <button
                onClick={handleReverse}
                className="font-display text-[11px] px-3.5 py-2 rounded-lg bg-elevated text-muted border border-white/[0.06] transition-all duration-200 hover:border-yellow-400 hover:text-yellow-400"
              >
                ↺ Reverse
              </button>
              <button
                onClick={handleReset}
                className="font-display text-[11px] px-3.5 py-2 rounded-lg bg-elevated text-muted border border-white/[0.06] transition-all duration-200 hover:border-coral hover:text-coral ml-auto"
              >
                Clear all
              </button>
            </div>

            {/* Log */}
            {logs.length > 0 && (
              <div className="bg-surface border border-white/[0.05] rounded-lg p-4 max-h-[160px] overflow-y-auto">
                {logs.map((log, i) => {
                  const cls =
                    log.type === 'error'
                      ? 'text-dim'
                      : log.type === 'delete'
                        ? 'text-coral'
                        : log.type === 'reverse'
                          ? 'text-yellow-400'
                          : log.type === 'add'
                            ? 'text-accent'
                            : 'text-blue-custom';
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

        {/* Reversal step-through */}
        <section className="max-w-content mx-auto px-8 mb-16 border-t border-white/[0.04] pt-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // step through
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-2 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              Reversing a linked list, one pointer at a time
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              Step through the reversal of [1 → 2 → 3]. Watch{' '}
              <span className="text-coral">prev</span>,{' '}
              <span className="text-accent">node</span>, and{' '}
              <span className="text-blue-custom">next</span> move through
              memory. See exactly which address each variable holds at each step
              — and why reassigning one doesn&apos;t change the others.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <ReversalStepper values={reversalValues} />
          </Reveal>
        </section>

        {/* Pointer explainer */}
        <section className="max-w-content mx-auto px-8 mb-16 border-t border-white/[0.04] pt-16">
          <Reveal>
            <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
              // why it works
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display font-bold tracking-tight mb-2 text-[clamp(1.4rem,2.5vw,1.8rem)]">
              Assignment copies addresses, not objects
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[0.95rem] text-muted leading-[1.7] mb-8 max-w-[600px]">
              The reason pointer manipulation works is that{' '}
              <code className="font-display text-[0.9em] bg-elevated px-1.5 py-0.5 rounded">
                a = b
              </code>{' '}
              copies the address{' '}
              <code className="font-display text-[0.9em] bg-elevated px-1.5 py-0.5 rounded">
                b
              </code>{' '}
              holds at that moment. It&apos;s a snapshot, not a subscription.
              Changing{' '}
              <code className="font-display text-[0.9em] bg-elevated px-1.5 py-0.5 rounded">
                b
              </code>{' '}
              later doesn&apos;t touch{' '}
              <code className="font-display text-[0.9em] bg-elevated px-1.5 py-0.5 rounded">
                a
              </code>
              . Step through below to see it.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <PointerExplainer />
          </Reveal>

          <Reveal delay={320}>
            <div className="bg-elevated border-l-[3px] border-accent px-5 py-4 rounded-r-lg mt-6 mb-4">
              <div className="font-display text-[11px] text-accent uppercase tracking-[1px] mb-1">
                💡 The rule
              </div>
              <p className="text-[13px] text-muted leading-[1.7]">
                <strong className="text-primary font-medium">
                  Reassigning a variable
                </strong>{' '}
                (
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  prev = node
                </code>
                ) only changes what that variable points to.{' '}
                <strong className="text-primary font-medium">
                  Mutating a property
                </strong>{' '}
                (
                <code className="font-display text-[12px] bg-bg px-1.5 py-0.5 rounded">
                  node.next = prev
                </code>
                ) changes the object, and anything else pointing to that object
                sees the change. That&apos;s two fundamentally different
                operations — and the entire linked list reversal depends on
                doing them in the right order.
              </p>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="bg-elevated border-l-[3px] border-coral px-5 py-4 rounded-r-lg mb-4">
              <div className="font-display text-[11px] text-coral uppercase tracking-[1px] mb-1">
                ⚠ This isn&apos;t just a JS thing
              </div>
              <p className="text-[13px] text-muted leading-[1.7]">
                JavaScript, Python, Java, C#, Go, Rust — they all work this way
                with reference types. Variables hold addresses. Assignment
                copies addresses. Mutation goes through the address to change
                the underlying object. Once you internalize this, pointer code
                in any language clicks.
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
              Generic, with append, prepend, delete, insertAt, and in-place
              reverse. No arrays used internally — just nodes and pointers.
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
          <span>Challenge #004</span>
        </div>
      </footer>
    </>
  );
}
