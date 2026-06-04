import Link from 'next/link';
import Reveal from './Reveal';

type Topic =
  | 'js-fundamentals'
  | 'typescript'
  | 'python'
  | 'algo-ds'
  | 'design-patterns'
  | 'system-design'
  | 'backend'
  | 'browser'
  | 'auth'
  | 'solid'
  | 'ai'
  | 'infra'
  | 'react'
  | 'personal';

interface Project {
  topic: Topic;
  name: string;
  desc: string;
  stack: string[];
  href: string;
}

const topicConfig: Record<Topic, { label: string; className: string }> = {
  'js-fundamentals': {
    label: 'JS fundamentals',
    className: 'bg-[#c8ff3e]/10 text-[#c8ff3e]',
  },
  typescript: {
    label: 'TypeScript',
    className: 'bg-[#3178c6]/15 text-[#5a9fd4]',
  },
  python: { label: 'Python', className: 'bg-[#ffbd2e]/10 text-[#ffbd2e]' },
  'algo-ds': {
    label: 'Algo & DS',
    className: 'bg-[#4a9eff]/10 text-[#4a9eff]',
  },
  'design-patterns': {
    label: 'Design patterns',
    className: 'bg-[#b18cff]/10 text-[#b18cff]',
  },
  'system-design': {
    label: 'System design',
    className: 'bg-[#ff6b4a]/10 text-[#ff6b4a]',
  },
  backend: { label: 'Backend', className: 'bg-[#28c840]/10 text-[#28c840]' },
  browser: { label: 'Browser', className: 'bg-[#ff9f43]/10 text-[#ff9f43]' },
  auth: {
    label: 'Auth & security',
    className: 'bg-[#ee5a6f]/10 text-[#ee5a6f]',
  },
  solid: { label: 'SOLID', className: 'bg-[#45aaf2]/10 text-[#45aaf2]' },
  ai: { label: 'AI & automation', className: 'bg-[#a55eea]/10 text-[#a55eea]' },
  infra: {
    label: 'Infra & DevOps',
    className: 'bg-[#778ca3]/10 text-[#778ca3]',
  },
  personal: { label: 'Personal', className: 'bg-[#fd79a8]/10 text-[#fd79a8]' },
  react: { label: 'React', className: 'bg-[#61dafb]/10 text-[#61dafb]' },
};

const projects: Project[] = [
  {
    topic: 'js-fundamentals',
    name: 'Promise.all from scratch',
    desc: "What happens when you await in a loop vs running promises concurrently? An interactive visual race and deep-dive into one of JavaScript's most misunderstood patterns.",
    stack: ['Promises', 'Concurrency', 'Closures', 'Event Loop'],
    href: '/challenges/promises',
  },
  {
    topic: 'react',
    name: 'List virtualization from scratch',
    desc: 'Rendering only a visible part of a very long list',
    stack: ['React', 'Virtualization', 'rAF', 'transform: translateY'],
    href: '/challenges/virtualization',
  },
  {
    topic: 'react',
    name: 'Compound component pattern',
    desc: 'Create tabs component with trigger, panel and list attached to it',
    stack: ['Compound', 'Tabs', 'react context', 'SOLID'],
    href: '/challenges/compound-tab',
  },
  {
    topic: 'react',
    name: 'Autocomplete',
    desc: 'Autocomplete component from scrtch',
    stack: ['Autocomplete', 'useDebounce', 'ARIA', 'Keyboard navigation'],
    href: '/challenges/autocomplete',
  },
  {
    topic: 'js-fundamentals',
    name: 'Debounce from scratch',
    desc: 'Type fast and watch the timeline. An interactive visualizer showing raw vs debounced function calls — closures, timers, and cleanup in 20 lines of code.',
    stack: ['Closures', 'setTimeout', 'Generics', 'this binding'],
    href: '/challenges/debounce',
  },
  {
    topic: 'js-fundamentals',
    name: 'Websockets price ticker',
    desc: 'Simulate real-world websocket connection with crypto prices',
    stack: ['WebSocket', 'setInterval', 'rAF', 'useRef'],
    href: '/challenges/websockets',
  },
  {
    topic: 'personal',
    name: '33 by 33',
    desc: "33 things to do before turning 33. A personal project tracking goals and milestones — with a surprise twist you'll have to click to find out.",
    stack: ['Next.js', 'React', 'TypeScript'],
    href: '/33-by-33',
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-24 border-t border-white/[0.04]">
      <div className="max-w-content mx-auto px-8">
        <Reveal>
          <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
            // projects
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-display font-bold tracking-tight mb-8 text-[clamp(1.6rem,3vw,2.2rem)]">
            Things I&apos;ve built{' '}
            <span className="text-[0.6em] text-dim">
              (that I&apos;m allowed to show)
            </span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => {
            const { label, className: topicClass } = topicConfig[project.topic];
            return (
              <Reveal key={project.name} delay={i * 80}>
                <Link
                  href={project.href}
                  className="block h-full hover:opacity-100"
                >
                  <div className="group bg-surface border border-white/[0.06] rounded-xl p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/20 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div
                      className={`inline-block font-display text-[10px] uppercase tracking-[1.5px] px-2.5 py-0.5 rounded mb-4 ${topicClass}`}
                    >
                      {label}
                    </div>
                    <div className="font-display text-[1.15rem] font-bold mb-2.5">
                      {project.name}
                    </div>
                    <div className="text-[0.9rem] text-muted mb-5 leading-[1.7]">
                      {project.desc}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="font-display text-[11px] px-2.5 py-0.5 rounded bg-elevated text-muted border border-white/[0.04]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
