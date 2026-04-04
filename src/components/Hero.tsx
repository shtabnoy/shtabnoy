import Terminal from './Terminal';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-32 pb-16">
      <div className="w-full max-w-content mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="font-display font-bold leading-[1.15] tracking-tight mb-6 text-[clamp(2.2rem,4.5vw,3.6rem)]">
              I build things
              <br />
              for the <span className="text-accent">web</span>
              <br />
              <span className="text-coral">
                &amp; occasionally
                <br />
                break them
              </span>
            </h1>
            <p className="text-[1.15rem] text-muted max-w-[480px] mb-8 leading-[1.7]">
              Senior Software Engineer with 10+ years of making pixels behave
              and servers respond. Currently scaling checkout flows for 30M+
              users at Kaufland e-commerce.
              <span className="block text-[0.8rem] text-dim mt-2 italic">
                No websites were harmed in the making of this portfolio. Okay,
                maybe one.
              </span>
            </p>
            <div className="flex gap-4 flex-wrap">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-7 py-3 font-display text-[13px] rounded-md bg-accent text-bg transition-all duration-200 hover:bg-[#d9ff6e] hover:opacity-100"
              >
                See my work ↓
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-3 font-display text-[13px] rounded-md bg-transparent text-primary border border-white/[0.15] transition-all duration-200 hover:border-accent hover:text-accent hover:opacity-100"
              >
                Get in touch
              </a>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Terminal />
          </div>
        </div>
      </div>
    </section>
  );
}
