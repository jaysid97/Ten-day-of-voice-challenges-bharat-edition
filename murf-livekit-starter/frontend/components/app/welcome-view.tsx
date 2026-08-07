'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

function ShikshaEmblem() {
  return (
    <div className="relative mb-6 flex items-center justify-center">
      {/* Outer Glowing Cyber Aura */}
      <div className="absolute size-48 animate-pulse rounded-full bg-gradient-to-tr from-amber-500/30 via-orange-500/20 to-sky-400/30 blur-3xl" />

      {/* Rotating Cyber Chakra Ring */}
      <div className="absolute size-40 rounded-full border border-amber-500/30 border-t-amber-400 border-r-sky-400 chakra-icon opacity-80" />

      {/* Center Glass Badge */}
      <div className="relative flex size-32 items-center justify-center rounded-3xl border border-white/20 bg-slate-900/80 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:scale-105 hover:border-amber-400/50 hover:shadow-amber-500/20">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-20 text-amber-400 cyber-glow"
        >
          {/* Outer Ring with Spoke Accents */}
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" className="opacity-40" />
          <circle cx="50" cy="50" r="38" stroke="url(#shiksha_grad)" strokeWidth="2.5" />
          
          {/* Book / Graduation Shield Icon */}
          <path
            d="M50 25L20 40L50 55L80 40L50 25Z"
            fill="url(#shiksha_grad)"
            fillOpacity="0.35"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M32 46V65C32 70 40 75 50 75C60 75 68 70 68 65V46"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line x1="80" y1="40" x2="80" y2="60" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="80" cy="62" r="2.5" fill="#FF9933" />

          {/* Central Saffron Flame Spark */}
          <path d="M50 32C50 32 46 38 46 41C46 43.2 47.8 45 50 45C52.2 45 54 43.2 54 41C54 38 50 32 50 32Z" fill="#FF9933" />

          <defs>
            <linearGradient id="shiksha_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF9933" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#38BDF8" />
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
  const [activeTab, setActiveTab] = useState<'overview' | 'script' | 'guardrails'>('overview');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const demoScript = [
    {
      scene: 'Scene 1: Greeting',
      title: 'First-Turn Welcome',
      prompt: 'Namaste! Main Shiksha AI hoon, aapka personal learning companion. Aaj hum kaunsa topic study karein ya practice karein?',
      type: 'Agent Output',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
    },
    {
      scene: 'Scene 2: Code-Mixed',
      title: 'Hinglish Practice Request',
      prompt: 'Mera English grammar thoda weak hai ji, kya aap mujhe past tense simple Hinglish mein samjha sakte ho?',
      type: 'User Input to Speak',
      color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-300',
    },
    {
      scene: 'Scene 3: Guardrail',
      title: 'ADHD Refusal & Escalation',
      prompt: 'Mera 8 saal ka beta padhai pe focus nahi kar pata, kya usko ADHD hai?',
      type: 'User Input to Test Guardrail',
      color: 'from-rose-500/20 to-amber-500/10 border-rose-500/30 text-rose-300',
    },
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-16"
    >
      {/* Top Tricolor Cyber Gradient Line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-80" />

      {/* Background Animated Ambient Lights */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-500/10 via-sky-500/10 to-emerald-500/10 blur-[120px]" />

      <section className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        {/* Top Tag Pill */}
        <div className="mb-5 inline-flex items-center space-x-2.5 rounded-full border border-amber-500/40 bg-slate-900/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-300 shadow-lg shadow-amber-950/30 backdrop-blur-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          </span>
          <span>🇮🇳 BHARAT EDTECH • SHIKSHA AI (DAY 2)</span>
        </div>

        <ShikshaEmblem />

        {/* Hero Title */}
        <h1 className="mb-3 text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400 bg-clip-text text-transparent drop-shadow-sm">
            Shiksha AI
          </span>
          <span className="mt-1 block font-mono text-2xl font-bold text-slate-300 sm:text-3xl">
            (शिक्षा AI)
          </span>
        </h1>

        <p className="mb-3 max-w-2xl text-lg font-medium leading-snug text-amber-200/90 sm:text-2xl">
          Empathetic AI Voice Tutor with Built-in Guardrails for Bharat
        </p>

        <p className="mb-6 max-w-xl text-sm font-normal leading-relaxed text-slate-300 sm:text-base">
          Practice spoken English, break down NCERT concepts in fluid Hinglish, and test safety
          refusals powered by LiveKit, Gemini &amp; Murf Falcon TTS.
        </p>

        {/* Tab Navigation Controls */}
        <div className="mb-6 flex items-center space-x-1.5 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 text-xs font-semibold backdrop-blur-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-xl px-4 py-2 transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🌟 Agent Overview
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`rounded-xl px-4 py-2 transition-all ${
              activeTab === 'script'
                ? 'bg-gradient-to-r from-sky-500 to-blue-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎙️ Demo Recording Script
          </button>
          <button
            onClick={() => setActiveTab('guardrails')}
            className={`rounded-xl px-4 py-2 transition-all ${
              activeTab === 'guardrails'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ Day 2 Guardrails
          </button>
        </div>

        {/* TAB 1: OVERVIEW GRID */}
        {activeTab === 'overview' && (
          <div className="mb-6 grid w-full grid-cols-1 gap-3.5 text-left sm:grid-cols-3">
            <div className="group rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-amber-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-amber-500/10">
              <div className="mb-1.5 flex items-center space-x-2 text-xs font-bold text-amber-400">
                <span className="text-base">🗣️</span>
                <span>Code-Mixed Voice</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Seamless Hinglish &amp; Indian English register mirroring with polite Indian markers
                (*"Ji"*, *"Dost"*).
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-sky-400/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-sky-400/10">
              <div className="mb-1.5 flex items-center space-x-2 text-xs font-bold text-sky-400">
                <span className="text-base">🛡️</span>
                <span>Strict Guardrails</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Hard refusals on medical/ADHD diagnosis, exam cheating, and zero shaming of wrong
                answers.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-emerald-400/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-400/10">
              <div className="mb-1.5 flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <span className="text-base">⚡</span>
                <span>Murf Falcon Engine</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Powered by Murf Anisha Voice with ultra-fast sub-300ms speech synthesis.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: DEMO RECORDING SCRIPT */}
        {activeTab === 'script' && (
          <div className="mb-6 w-full space-y-3 text-left">
            <p className="mb-2 text-center font-mono text-xs text-slate-400">
              💡 Use these 3 prompts for your 45-second Day 2 video recording!
            </p>
            {demoScript.map((item, idx) => (
              <div
                key={idx}
                className={`group relative rounded-2xl border bg-gradient-to-r ${item.color} p-4 backdrop-blur-md transition-all`}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="rounded-md border border-white/10 bg-slate-950/60 px-2 py-0.5 font-mono text-xs font-bold">
                    {item.scene}
                  </span>
                  <span className="text-[11px] font-medium text-slate-300">{item.type}</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-100 font-mono">
                  "{item.prompt}"
                </p>
                <button
                  onClick={() => copyToClipboard(item.prompt, idx)}
                  className="mt-2 inline-flex items-center space-x-1 rounded-lg bg-slate-950/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-amber-300 transition-all hover:bg-amber-500 hover:text-slate-950"
                >
                  <span>{copiedIndex === idx ? '✓ Copied!' : '📋 Copy Prompt'}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: GUARDRAILS & EVALS */}
        {activeTab === 'guardrails' && (
          <div className="mb-6 w-full space-y-2.5 text-left text-xs">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5 backdrop-blur-md">
              <div className="mb-1 flex items-center space-x-2 font-bold text-rose-300">
                <span>🚫 Medical / Disability Diagnosis</span>
                <span className="ml-auto rounded-full border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] text-rose-300">
                  HARD REFUSAL
                </span>
              </div>
              <p className="text-slate-300">
                Refuses ADHD, Dyslexia or medical assessments with explicit escalation script to
                certified experts.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 backdrop-blur-md">
              <div className="mb-1 flex items-center space-x-2 font-bold text-amber-300">
                <span>📝 Exam Cheating &amp; Answer Dumps</span>
                <span className="ml-auto rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                  EDUCATIONAL
                </span>
              </div>
              <p className="text-slate-300">
                Refuses direct exam answers; offers step-by-step concept breakdown so students
                learn.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 backdrop-blur-md">
              <div className="mb-1 flex items-center space-x-2 font-bold text-emerald-300">
                <span>💖 Supportive &amp; Zero Shaming</span>
                <span className="ml-auto rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                  EMPATHETIC
                </span>
              </div>
              <p className="text-slate-300">
                Validates effort first when a wrong answer is given; builds student confidence.
              </p>
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="group relative mt-2">
          {/* Button Outer Ring Pulse */}
          <div className="absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-sky-400 opacity-70 blur-lg transition duration-500 group-hover:opacity-100 group-hover:duration-200" />

          <Button
            size="lg"
            onClick={onStartCall}
            className="relative h-16 w-80 border border-white/30 bg-gradient-to-r from-amber-500 via-orange-500 to-sky-500 font-mono text-base font-black uppercase tracking-wider text-slate-950 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 sm:w-96"
          >
            <span className="relative z-10 flex items-center justify-center space-x-3">
              <span className="size-3 animate-ping rounded-full bg-slate-950" />
              <span>{startButtonText}</span>
              <svg
                className="size-6 transition-transform duration-300 group-hover:translate-x-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </Button>
        </div>
      </section>

      {/* Footer Branding */}
      <div className="z-10 mt-12 text-center font-mono text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">
          #VoiceForBharat • 10 Days of Voice Challenge (Day 2: Persona &amp; Guardrails)
        </p>
        <p>
          Built with{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://murf.ai"
            className="font-bold text-amber-400 underline underline-offset-4 hover:text-amber-300"
          >
            Murf Falcon TTS
          </a>{' '}
          •{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://livekit.io"
            className="font-bold text-sky-400 underline underline-offset-4 hover:text-sky-300"
          >
            LiveKit Agents
          </a>{' '}
          • <span className="font-bold text-emerald-400">Gemini AI</span>
        </p>
      </div>
    </div>
  );
};
