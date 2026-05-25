import Reveal from './Reveal';

const experiences = [
  {
    period: '2025 — Present',
    company: 'Kaufland e-commerce',
    role: 'Senior Frontend Engineer',
    detail:
      'Worked on end-to-end checkout flow (delivery, payment, confirmation) on a platform serving 10M+ monthly customers across 7+ markets. Implemented Apple Pay and Google Pay and launched them in new markets.',
  },
  {
    period: '2022 — 2024',
    company: 'Warner Bros. Discovery',
    role: 'Senior Software Engineer',
    detail:
      'Designed major parts of Monetization, User management and Subscriptions with React and Typescript in a back-office platform (10+ applications in a Yarn monorepo across multiple markets).',
  },
  {
    period: '2021 — 2022',
    company: 'Fyndiq (CDON Group)',
    role: 'Frontend Developer',
    detail:
      'Developed features for a customer-facing e-commerce marketplace (~1M users). Contributed components to the shared React + TypeScript + Storybook library used by both the customer and merchant teams, reducing duplicated styling code across surfaces.',
  },
  {
    period: '2019 — 2021',
    company: 'Daniel Wellington',
    role: 'Web Developer',
    detail:
      'Co-led the migration of the entire frontend from Angular to React + TypeScript. Built a shared UI component library (React + TypeScript + Storybook), as a cross-team initiative with frequent pair programming; adopted by 3 product teams.',
  },
  {
    period: '2016 — 2019',
    company: 'Starflow · Luxoft · Angstrem',
    role: 'Full-Stack / Frontend Developer',
    detail:
      'Built platforms with React, React Native, Node.js, PostgreSQL. Created real-time geo-visualization rendering 10K+ data points. Where the journey began.',
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-24 border-t border-white/[0.04]">
      <div className="max-w-content mx-auto px-8">
        <Reveal>
          <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
            // experience
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-display font-bold tracking-tight mb-8 text-[clamp(1.6rem,3vw,2.2rem)]">
            Where I&apos;ve left my mark{' '}
            <span className="text-[0.6em] text-dim">(and git history)</span>
          </h2>
        </Reveal>
        <div>
          {experiences.map(({ period, company, role, detail }, i) => (
            <Reveal key={company} delay={i * 80}>
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8 py-8 border-b border-white/[0.04] last:border-b-0">
                <div className="font-display text-[13px] text-dim">
                  {period}
                </div>
                <div>
                  <div className="text-[1.1rem] font-semibold mb-1">
                    {company}
                  </div>
                  <div className="font-display text-[0.85rem] text-accent-dim mb-3">
                    {role}
                  </div>
                  <div className="text-[0.9rem] text-muted leading-[1.7]">
                    {detail}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
