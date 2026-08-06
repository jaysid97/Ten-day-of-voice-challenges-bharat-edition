import { Button } from '@/components/ui/button';

function BharatChakraEmblem() {
  return (
    <div className="relative mb-6 flex items-center justify-center">
      {/* Outer Glowing Cyber Ring */}
      <div className="absolute size-36 animate-pulse rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-cyan-500/20 blur-xl" />
      
      {/* Center Glass Capsule */}
      <div className="relative flex size-28 items-center justify-center rounded-3xl border border-white/15 bg-slate-900/60 shadow-2xl backdrop-blur-xl">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-16 text-amber-400 chakra-icon"
        >
          {/* Outer Chakra Rim */}
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="38" stroke="url(#saffron_cyan)" strokeWidth="3" />
          <circle cx="50" cy="50" r="14" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="5" fill="#00E5FF" />
          
          {/* 24 Spokes of Ashoka Chakra */}
          {[...Array(24)].map((_, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + 36 * Math.cos((i * 15 * Math.PI) / 180)}
              y2={50 + 36 * Math.sin((i * 15 * Math.PI) / 180)}
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          ))}

          <defs>
            <linearGradient id="saffron_cyan" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF9933" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#00E5FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="flex min-h-screen flex-col items-center justify-center px-4 pt-16 pb-12">
      <section className="relative z-10 flex max-w-xl flex-col items-center text-center">
        {/* Top Tag Pill */}
        <div className="mb-4 inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-950/40 px-3.5 py-1 text-xs font-semibold tracking-wider text-amber-300 backdrop-blur-md">
          <span>🇮🇳</span>
          <span>BHARAT VOICE AI • INDICVOX</span>
        </div>

        <BharatChakraEmblem />

        <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          <span className="saffron-gradient-text">IndicVox AI</span>
        </h1>

        <p className="max-w-md text-sm text-slate-300 font-medium leading-relaxed sm:text-base">
          Experience ultra-fast, conversational voice AI tailored for India.
          Talk naturally in English with authentic Indian phrasing.
        </p>

        {/* Feature Pills */}
        <div className="my-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 font-mono text-cyan-300">
            🎙️ Murf Anisha Voice
          </span>
          <span className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 font-mono text-amber-300">
            ⚡ 300ms Low-Latency
          </span>
          <span className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 font-mono text-emerald-300">
            🧠 Gemini 3.5 Flash
          </span>
        </div>

        {/* Start Button */}
        <Button
          size="lg"
          onClick={onStartCall}
          className="group relative mt-2 h-13 w-72 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 font-mono text-sm font-bold tracking-wider text-slate-950 uppercase shadow-xl shadow-amber-500/25 transition-all duration-300 hover:scale-105 hover:shadow-amber-500/40 active:scale-95"
        >
          <span className="relative z-10 flex items-center justify-center space-x-2">
            <span>{startButtonText}</span>
            <svg className="size-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-amber-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Button>
      </section>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-slate-500">
        <p>
          Powered by{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://murf.ai"
            className="text-amber-400 underline underline-offset-4 hover:text-amber-300"
          >
            Murf Falcon TTS
          </a>{' '}
          &amp;{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://livekit.io"
            className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
          >
            LiveKit Agents
          </a>
        </p>
      </div>
    </div>
  );
};
