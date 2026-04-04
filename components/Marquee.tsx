const skills = [
  'React', 'TypeScript', 'Vue.js', 'Node.js', 'Next.js',
  'PostgreSQL', 'Docker', 'Python', 'GraphQL', 'Redis',
  'AWS', 'Tailwind', 'n8n', 'AI tools', 'Cypress', 'Playwright',
];

export default function Marquee() {
  const doubled = [...skills, ...skills];

  return (
    <div className="border-t border-b border-white/[0.06] py-5 overflow-hidden whitespace-nowrap">
      <div className="marquee-track">
        {doubled.map((skill, i) => (
          <span
            key={i}
            className="font-display text-[13px] text-dim uppercase tracking-[2px] px-8 before:content-['◆'] before:mr-8 before:text-accent before:text-[8px] before:align-middle"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
