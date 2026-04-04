import Link from 'next/link';
import Reveal from './Reveal';

type Status = 'live' | 'wip' | 'soon';

interface Project {
  status: Status;
  name: string;
  desc: string;
  stack: string[];
  href?: string;
  external?: boolean;
}

const projects: Project[] = [
  {
    status: 'wip',
    name: 'taskflow-api',
    desc: 'Production-grade REST API for task management. JWT auth, role-based access, PostgreSQL with Prisma, Redis caching, rate limiting, full test coverage. My backend architecture showcase.',
    stack: ['TypeScript', 'Express', 'PostgreSQL', 'Prisma', 'Redis', 'Docker'],
  },
  {
    status: 'soon',
    name: 'AI document analyzer',
    desc: 'Full-stack SaaS app: upload documents, get AI-powered analysis, summaries, and insights. Next.js frontend, Node.js API, OpenAI integration, vector database for semantic search.',
    stack: ['Next.js', 'Node.js', 'OpenAI API', 'Pinecone', 'Vercel'],
  },
  {
    status: 'wip',
    name: 'leetcode-solutions',
    desc: 'Curated algorithm solutions in TypeScript and Python with detailed complexity analysis, approach explanations, and pattern categorization. Because interviews are still a thing.',
    stack: ['TypeScript', 'Python', 'Algorithms'],
  },
  {
    status: 'soon',
    name: 'n8n AI workflows',
    desc: 'Collection of production-ready AI automation workflows: RAG pipelines, intelligent email classifiers, Slack bots with memory, and webhook-driven data processors.',
    stack: ['n8n', 'LangChain', 'OpenAI', 'Python'],
  },
  {
    status: 'live',
    name: '33 by 33',
    desc: '33 things to do before turning 33. A personal project tracking goals and milestones — built with Next.js and React Query.',
    stack: ['Next.js', 'React Query', 'TypeScript'],
    href: '/33-by-33',
  },
];

const statusConfig: Record<Status, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-accent/10 text-accent' },
  wip: { label: 'In progress', className: 'bg-coral/10 text-coral' },
  soon: { label: 'Coming soon', className: 'bg-blue-custom/10 text-blue-custom' },
};

export default function Projects() {
  return (
    <section
      id="projects"
      className="py-24 border-t border-white/[0.04]"
    >
      <div className="max-w-content mx-auto px-8">
        <Reveal>
          <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
            // projects
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-display font-bold tracking-tight mb-8 text-[clamp(1.6rem,3vw,2.2rem)]">
            Things I&apos;ve built{' '}
            <span className="text-[0.6em] text-dim">(that I&apos;m allowed to show)</span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => {
            const { label, className: statusClass } = statusConfig[project.status];
            const card = (
              <div className="group bg-surface border border-white/[0.06] rounded-xl p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/20 relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div
                  className={`inline-block font-display text-[10px] uppercase tracking-[1.5px] px-2.5 py-0.5 rounded mb-4 ${statusClass}`}
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
            );

            return (
              <Reveal key={project.name} delay={i * 80}>
                {project.href ? (
                  <Link href={project.href} className="block h-full hover:opacity-100">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
