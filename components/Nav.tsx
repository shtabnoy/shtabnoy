import Link from 'next/link';

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
];

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-bg/85 backdrop-blur-md border-b border-white/[0.04]">
      <Link
        href="/"
        className="font-display text-[15px] text-primary tracking-tight"
        style={{ opacity: 1 }}
      >
        denis<span className="text-accent">.</span>shtabnoy
      </Link>
      <div className="hidden md:flex gap-8">
        {navLinks.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="text-[13px] text-muted uppercase tracking-[1.5px] font-display transition-colors duration-200 hover:text-accent hover:opacity-100"
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
