import Link from 'next/link';
import Reveal from './Reveal';

type Status = 'live';

interface Project {
  status: Status;
  name: string;
  desc: string;
  stack: string[];
  href: string;
}

const projects: Project[] = [
  {
    status: 'live',
    name: 'Promise.all from scratch',
    desc: "What happens when you await in a loop vs running promises concurrently? An interactive visual race and deep-dive into one of JavaScript's most misunderstood patterns. Built with zero libraries.",
    stack: ['JavaScript', 'Promises', 'Concurrency', 'Closures'],
    href: '/promises',
  },
  {
    status: 'live',
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
          {projects.map((project, i) => (
            <Reveal key={project.name} delay={i * 80}>
              <Link
                href={project.href}
                className="block h-full hover:opacity-100"
              >
                <div className="group bg-surface border border-white/[0.06] rounded-xl p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/20 relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="inline-block font-display text-[10px] uppercase tracking-[1.5px] px-2.5 py-0.5 rounded mb-4 bg-accent/10 text-accent">
                    Live
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
          ))}
        </div>
      </div>
    </section>
  );
}
