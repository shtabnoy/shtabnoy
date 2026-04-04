import Reveal from './Reveal';

const experiences = [
  {
    period: '2025 — Present',
    company: 'Kaufland e-commerce',
    role: 'Software Engineer, Frontend',
    detail:
      'Scaling frontend for 30M+ MAU across 8 markets. Own the checkout flow processing 50K+ daily transactions. Reduced LCP by 25%, improved checkout conversion by 12% through A/B testing. Integrated Adyen, Apple Pay, Google Pay.',
  },
  {
    period: '2022 — 2024',
    company: 'Warner Bros. Discovery',
    role: 'Senior Software Engineer',
    detail:
      'Architected 10+ React back-office apps used by 500+ internal users. Built a design system with 60+ components. Increased code coverage from 45% to 85%, reducing production bugs by 50%.',
  },
  {
    period: '2021 — 2022',
    company: 'Fyndiq (CDON Group)',
    role: 'Frontend Developer',
    detail:
      'Built features for a marketplace with 2M+ products. Reduced page load by 30%. Created a reusable component library and coding standards.',
  },
  {
    period: '2019 — 2021',
    company: 'Daniel Wellington',
    role: 'Web Developer',
    detail:
      'Led Angular-to-React migration across 4 apps, reducing bundle size by 35%. Introduced GraphQL, cutting data fetching time by 50%. Built a 40+ component UI library with Storybook.',
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
    <section
      id="experience"
      className="py-24 border-t border-white/[0.04]"
    >
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
                <div className="font-display text-[13px] text-dim">{period}</div>
                <div>
                  <div className="text-[1.1rem] font-semibold mb-1">{company}</div>
                  <div className="font-display text-[0.85rem] text-accent-dim mb-3">{role}</div>
                  <div className="text-[0.9rem] text-muted leading-[1.7]">{detail}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
