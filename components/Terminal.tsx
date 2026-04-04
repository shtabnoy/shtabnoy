export default function Terminal() {
  return (
    <div className="bg-surface border border-white/[0.06] rounded-xl overflow-hidden font-display text-[13px] leading-[1.8]">
      <div className="flex items-center gap-1.5 px-4 py-3 bg-white/[0.03] border-b border-white/[0.04]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="px-6 py-5">
        <div>
          <span className="text-accent">~</span>{' '}
          <span className="text-primary">cat about.json</span>
        </div>
        <div className="text-primary">{'{'}</div>
        <div>
          &nbsp;&nbsp;<span className="text-blue-custom">&quot;name&quot;</span>:{' '}
          <span className="text-coral">&quot;Denis Shtabnoy&quot;</span>,
        </div>
        <div>
          &nbsp;&nbsp;<span className="text-blue-custom">&quot;location&quot;</span>:{' '}
          <span className="text-coral">&quot;Berlin, DE&quot;</span>,
        </div>
        <div>
          &nbsp;&nbsp;<span className="text-blue-custom">&quot;role&quot;</span>:{' '}
          <span className="text-coral">&quot;Senior Software Engineer&quot;</span>,
        </div>
        <div>
          &nbsp;&nbsp;<span className="text-blue-custom">&quot;coffee_today&quot;</span>:{' '}
          <span className="text-coral">3</span>,
        </div>
        <div>
          &nbsp;&nbsp;<span className="text-blue-custom">&quot;mass_produced_bugs&quot;</span>:{' '}
          <span className="text-coral">0</span>,
        </div>
        <div className="text-dim">&nbsp;&nbsp;{'//'} ^^ technically unverifiable</div>
        <div>
          &nbsp;&nbsp;<span className="text-blue-custom">&quot;stack&quot;</span>: [
          <span className="text-coral">&quot;React&quot;</span>,{' '}
          <span className="text-coral">&quot;Vue&quot;</span>,{' '}
          <span className="text-coral">&quot;TS&quot;</span>,
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-coral">&quot;Node&quot;</span>,{' '}
          <span className="text-coral">&quot;Python&quot;</span>,{' '}
          <span className="text-coral">&quot;Postgres&quot;</span>],
        </div>
        <div>
          &nbsp;&nbsp;<span className="text-blue-custom">&quot;open_to_work&quot;</span>:{' '}
          <span className="text-coral">true</span>
        </div>
        <div className="text-primary">{'}'}</div>
        <div>
          <span className="text-accent">~</span> <span className="cursor-blink" />
        </div>
      </div>
    </div>
  );
}
