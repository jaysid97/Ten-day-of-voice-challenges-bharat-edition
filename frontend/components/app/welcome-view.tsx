'use client';

import { useState } from 'react';
import { HumanAITutor } from '@/components/app/human-ai-tutor';
import { Button } from '@/components/ui/button';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
  hasEndedCall?: boolean;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  hasEndedCall = false,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'states' | 'script' | 'guardrails'>('overview');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

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

  const agentStatesList = [
    {
      state: 'State 1: Ready',
      desc: 'Agent has not started yet; 1 clear start button',
      icon: '🟢',
      badge: 'READY (तैयार)',
      color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
    },
    {
      state: 'State 2: Connecting',
      desc: 'Agent is joining call; tells user to wait',
      icon: '🟡',
      badge: 'CONNECTING (जोड़ रहे हैं)',
      color: 'border-sky-500/40 bg-sky-950/30 text-sky-300',
    },
    {
      state: 'State 3: Listening',
      desc: 'Agent is listening to the user speak',
      icon: '🎤',
      badge: 'LISTENING (आपकी बात सुन रहे हैं)',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
    },
    {
      state: 'State 4: Speaking',
      desc: 'Agent is replying to user via Murf TTS',
      icon: '🔊',
      badge: 'SPEAKING (Shiksha AI बोल रही है)',
      color: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    },
    {
      state: 'State 5: Call ended',
      desc: 'Conversation is over; option to start again',
      icon: '🔴',
      badge: 'CALL ENDED (समाप्त)',
      color: 'border-rose-500/40 bg-rose-950/30 text-rose-300',
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
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-14 pb-16 school-grid-bg"
    >
      {/* Top Tricolor Cyber Gradient Line */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-90" />

      {/* Ambient Smart Classroom Window Lighting */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 size-[650px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-500/15 via-sky-500/15 to-emerald-500/15 blur-[130px]" />

      <section className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        {/* Language & Track Header Bar */}
        <div className="mb-4 flex items-center justify-between w-full max-w-xl px-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/40 bg-slate-900/90 px-4 py-1.5 text-xs font-extrabold text-amber-300 shadow-lg backdrop-blur-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            </span>
            <span>🇮🇳 BHARAT EDTECH • HUMAN AI CLASSROOM</span>
          </div>

          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="inline-flex items-center space-x-1.5 rounded-full border border-white/20 bg-slate-900/90 px-3.5 py-1.5 text-xs font-extrabold text-amber-300 shadow-md hover:bg-slate-800 transition-all active:scale-95"
          >
            <span>{lang === 'en' ? '🇮🇳 हिन्दी' : '🌐 English'}</span>
          </button>
        </div>

        {/* State 5 Banner if Call Ended */}
        {hasEndedCall && (
          <div className="mb-6 w-full animate-bounce rounded-2xl border border-rose-500/40 bg-rose-950/70 p-4 text-rose-200 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-center space-x-2 font-mono text-sm font-extrabold text-rose-300">
              <span className="size-3 rounded-full bg-rose-500 animate-ping" />
              <span>🔴 {lang === 'hi' ? 'कॉन्वर्सेशन समाप्त (Call Ended)' : 'Call Ended'}</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              {lang === 'hi'
                ? 'आपका वॉइस सेशन समाप्त हो गया है। नया लेसन शुरू करने के लिए नीचे बटन दबाएं।'
                : 'Your voice session with Shiksha AI has concluded. Click below to start a new lesson.'}
            </p>
          </div>
        )}

        {/* Human AI Tutor Interactive Character Avatar */}
        <HumanAITutor state={hasEndedCall ? 'ended' : 'ready'} size="lg" />

        {/* Hero Title */}
        <h1 className="mb-2 text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400 bg-clip-text text-transparent drop-shadow-sm">
            Shiksha AI
          </span>
          <span className="mt-1 block font-mono text-2xl font-bold text-slate-300 sm:text-3xl">
            (शिक्षा AI)
          </span>
        </h1>

        {/* State 1: Ready Badge */}
        <div className="mb-3 inline-flex items-center space-x-2 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-3.5 py-1 text-xs font-extrabold text-emerald-300 shadow-md">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {lang === 'hi'
              ? '🟢 स्टेट 1: एजेंट तैयार है (Ready to Connect)'
              : '🟢 State 1: Agent Ready'}
          </span>
        </div>

        <p className="mb-3 max-w-2xl text-lg font-medium leading-snug text-amber-200/90 sm:text-2xl">
          {lang === 'hi'
            ? 'भारत के लिए सहानुभूतिपूर्ण Human AI वॉइस ट्यूटर'
            : 'Empathetic Human-Type AI Voice Tutor for Smart Classrooms'}
        </p>

        <p className="mb-6 max-w-xl text-sm font-normal leading-relaxed text-slate-300 sm:text-base">
          {lang === 'hi'
            ? 'बोलचाल की अंग्रेजी का अभ्यास करें, हिन्ग्लिश में अवधारणाओं को समझें और स्मार्ट क्लासरूम में सीखें।'
            : 'Practice spoken English, break down NCERT concepts in fluid Hinglish, and experience smart classroom voice AI.'}
        </p>

        {/* Tab Navigation Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 text-xs font-semibold backdrop-blur-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-xl px-3.5 py-2 transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🌟 Overview
          </button>
          <button
            onClick={() => setActiveTab('states')}
            className={`rounded-xl px-3.5 py-2 transition-all ${
              activeTab === 'states'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 5 Agent States
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`rounded-xl px-3.5 py-2 transition-all ${
              activeTab === 'script'
                ? 'bg-gradient-to-r from-sky-500 to-blue-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎙️ Recording Script
          </button>
          <button
            onClick={() => setActiveTab('guardrails')}
            className={`rounded-xl px-3.5 py-2 transition-all ${
              activeTab === 'guardrails'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ Guardrails
          </button>
        </div>

        {/* TAB 1: OVERVIEW GRID */}
        {activeTab === 'overview' && (
          <div className="mb-6 grid w-full grid-cols-1 gap-3.5 text-left sm:grid-cols-3">
            <div className="group rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-md transition-all hover:border-amber-500/50 hover:bg-slate-900/95 hover:shadow-xl hover:shadow-amber-500/10">
              <div className="mb-1.5 flex items-center space-x-2 text-xs font-bold text-amber-400">
                <span className="text-base">👤</span>
                <span>Human AI Tutor</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Friendly character avatar with animated expressions, blinking eyes, and dynamic mouth equalizer.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-md transition-all hover:border-sky-400/50 hover:bg-slate-900/95 hover:shadow-xl hover:shadow-sky-400/10">
              <div className="mb-1.5 flex items-center space-x-2 text-xs font-bold text-sky-400">
                <span className="text-base">🏫</span>
                <span>Smart Classroom UI</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Attractive digital blackboard backdrop with floating academic symbols (books, math, symbols).
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-md transition-all hover:border-emerald-400/50 hover:bg-slate-900/95 hover:shadow-xl hover:shadow-emerald-400/10">
              <div className="mb-1.5 flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <span className="text-base">⚡</span>
                <span>Murf Falcon TTS</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Powered by Murf Anisha Voice with sub-300ms natural spoken Indian conversational register.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: DAY 3 FIVE AGENT STATES */}
        {activeTab === 'states' && (
          <div className="mb-6 grid w-full grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
            {agentStatesList.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border ${item.color} p-3 backdrop-blur-md transition-all`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-extrabold">{item.state}</span>
                  <span className="text-[11px] font-bold">{item.badge}</span>
                </div>
                <p className="text-xs leading-snug text-slate-200">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: DEMO RECORDING SCRIPT */}
        {activeTab === 'script' && (
          <div className="mb-6 w-full space-y-3 text-left">
            <p className="mb-2 text-center font-mono text-xs text-slate-400">
              💡 Use these prompts to record your Day 3 video demonstration!
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

        {/* TAB 4: GUARDRAILS & EVALS */}
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

        {/* Start Button (State 1 & State 5 restart) */}
        <div className="group relative mt-2">
          <div className="absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-sky-400 opacity-75 blur-lg transition duration-500 group-hover:opacity-100 group-hover:duration-200" />

          <Button
            size="lg"
            onClick={onStartCall}
            className="relative h-16 w-80 border border-white/30 bg-gradient-to-r from-amber-500 via-orange-500 to-sky-500 font-mono text-base font-black uppercase tracking-wider text-slate-950 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 sm:w-96"
          >
            <span className="relative z-10 flex items-center justify-center space-x-3">
              <span className="size-3 animate-ping rounded-full bg-slate-950" />
              <span>{hasEndedCall ? (lang === 'hi' ? 'फिर से शुरू करें (Start Again)' : 'Start Again / New Lesson') : (lang === 'hi' ? 'कॉल शुरू करें (Start Call)' : startButtonText)}</span>
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
      <div className="z-10 mt-10 text-center font-mono text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">
          #VoiceForBharat • 10 Days of Voice Challenge (Day 3: Human AI &amp; Smart Classroom)
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
