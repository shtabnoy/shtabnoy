import Reveal from './Reveal';

const stats = [
  {
    number: '10+',
    label: 'Years of experience',
    footnote: 'and still Googling CSS flexbox',
  },
  {
    number: '30M+',
    label: 'Monthly users served',
    footnote: 'at current job alone',
  },
  {
    number: '50K+',
    label: 'Daily transactions',
    footnote: 'checkout flow I own',
  },
  {
    number: '8',
    label: 'European markets',
    footnote: 'and counting',
  },
];

export default function About() {
  return (
    <section id="about" className="py-24">
      <div className="max-w-content mx-auto px-8">
        <Reveal>
          <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
            // about
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-display font-bold tracking-tight mb-8 text-[clamp(1.6rem,3vw,2.2rem)]">
            The short version
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Reveal delay={160}>
            <div className="text-[1.05rem] text-muted leading-[1.8] space-y-5">
              <p>
                I&apos;ve been building for the web since 2016, starting with
                AngularJS and real-time geo-visualization in Russia, then moving
                to Stockholm where I shipped products at{' '}
                <strong className="text-primary font-medium">
                  Daniel Wellington
                </strong>
                ,{' '}
                <strong className="text-primary font-medium">Fyndiq</strong>,
                and{' '}
                <strong className="text-primary font-medium">
                  Warner Bros. Discovery
                </strong>
                . Now I&apos;m in Berlin, scaling frontend systems at{' '}
                <strong className="text-primary font-medium">
                  Kaufland e-commerce
                </strong>{' '}
                — one of Germany&apos;s biggest online marketplaces.
              </p>
              <p>
                I care most about the intersection of{' '}
                <strong className="text-primary font-medium">
                  developer experience and user impact
                </strong>
                : clean architecture that ships fast, checkout flows that
                convert, and performance budgets that get respected. I&apos;m
                currently deep-diving into{' '}
                <strong className="text-primary font-medium">
                  backend engineering, AI automation, and system design
                </strong>{' '}
                because I believe the best engineers in 2026 own the full stack.
              </p>
              <p>
                When I&apos;m not coding, I&apos;m probably reading self-help
                books (at least 2.5 so far) or giving unsolicited life advice to
                friends who didn&apos;t ask for it.
              </p>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ number, label, footnote }) => (
                <div
                  key={label}
                  className="bg-surface border border-white/[0.06] rounded-xl p-6"
                >
                  <div className="font-display text-[2rem] font-bold text-accent leading-none">
                    {number}
                  </div>
                  <div className="text-[13px] text-muted mt-1.5">{label}</div>
                  <div className="text-[11px] text-dim italic mt-1">
                    {footnote}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
