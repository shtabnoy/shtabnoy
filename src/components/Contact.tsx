import Reveal from './Reveal';

const links = [
  {
    href: 'mailto:denis.shtabnoy@gmail.com',
    label: 'Email',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4L12 13 2 4" />
      </svg>
    ),
  },
  {
    href: 'https://linkedin.com/in/denisshtabnoy',
    label: 'LinkedIn',
    external: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    href: 'https://github.com/shtabnoy',
    label: 'GitHub',
    external: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
      </svg>
    ),
  },
];

export default function Contact() {
  return (
    <section
      id="contact"
      className="py-24 border-t border-white/[0.04] text-center"
    >
      <div className="max-w-content mx-auto px-8">
        <Reveal>
          <div className="font-display text-[11px] uppercase tracking-[3px] text-accent mb-4">
            // contact
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-display font-bold tracking-tight mb-4 text-[clamp(1.8rem,3.5vw,2.8rem)]">
            Let&apos;s build something
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="text-[1.05rem] text-muted mb-10 max-w-[520px] mx-auto">
            I&apos;m open to remote opportunities — especially if your team ships
            fast, cares about craft, and doesn&apos;t do &quot;quick syncs&quot;
            that last 45 minutes.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="flex justify-center gap-6 flex-wrap">
            {links.map(({ href, label, icon, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-2 font-display text-[13px] text-muted px-6 py-2.5 border border-white/[0.1] rounded-lg transition-all duration-200 hover:text-accent hover:border-accent hover:opacity-100"
              >
                {icon}
                {label}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
