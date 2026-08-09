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
  const [activeTab, setActiveTab] = useState<'overview' | 'day4memory' | 'states' | 'guardrails'>('day4memory');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const day4MemoryDemoScript = [
    {
      scene: 'Call 1: Introduce & Grant Consent',
      title: 'First Call (New Learner)',
      prompt: 'मेरा नाम रमेश है, मैं Class 8 का मैथ फ्रैक्शंस पढ़ना चाहता हूँ।',
      expectedOutcome: 'Agent introduces topic and asks: "रमेश जी, क्या मैं आपका लर्निंग डेटा सेव कर लूँ?"',
      userConsent: 'हाँ, सेव कर लो',
      type: 'Call 1 Flow',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
    },
    {
      scene: 'Call 2: Returning Learner Greeting',
      title: 'Second Call (Returning Learner)',
      prompt: '(Connect session again without giving name)',
      expectedOutcome: 'Agent immediately greets: "नमस्ते रमेश जी! पिछली बार हमने Class 8 Math fractions पढ़ा था..."',
      userConsent: 'Auto-retrieved from SQLite DB',
      type: 'Call 2 Flow',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
    },
    {
      scene: 'Advanced: Wipe Learner Record',
      title: 'Forget Me Tool',
      prompt: 'मेरा डेटा डिलीट कर दो (Forget me)',
      expectedOutcome: 'Agent executes forget_caller("ramesh") tool and confirms record deletion.',
      userConsent: 'Database Record Wiped',
      type: 'Optional Wipe Flow',
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
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-10 school-grid-bg"
    >
      {/* Top Tricolor Cyber Gradient Line */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-90" />

      {/* Ambient Smart Classroom Window Lighting */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-500/15 via-sky-500/15 to-emerald-500/15 blur-[120px]" />

      <section className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        {/* Language & Track Header Bar */}
        <div className="mb-2 flex items-center justify-between w-full max-w-xl px-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/40 bg-slate-900/90 px-3 py-1 text-[11px] font-extrabold text-amber-300 shadow-lg backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            <span>🇮🇳 DAY 4 • PERSISTENT MEMORY &amp; SQLITE</span>
          </div>

          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="inline-flex items-center space-x-1 rounded-full border border-white/20 bg-slate-900/90 px-3 py-1 text-[11px] font-extrabold text-amber-300 shadow-md hover:bg-slate-800 transition-all active:scale-95"
          >
            <span>{lang === 'en' ? '🇮🇳 हिन्दी' : '🌐 English'}</span>
          </button>
        </div>

        {/* State 5 Banner if Call Ended */}
        {hasEndedCall && (
          <div className="mb-4 w-full animate-bounce rounded-xl border border-rose-500/40 bg-rose-950/70 p-3 text-rose-200 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-center space-x-2 font-mono text-xs font-extrabold text-rose-300">
              <span className="size-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>🔴 {lang === 'hi' ? 'कॉन्वर्सेशन समाप्त (Call Ended)' : 'Call Ended'}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-300">
              {lang === 'hi'
                ? 'आपका वॉइस सेशन समाप्त हो गया है। नया सेशन शुरू करने के लिए नीचे बटन दबाएं।'
                : 'Your voice session with Shiksha AI has concluded. Click below to test Call 2 returning greeting.'}
            </p>
          </div>
        )}

        {/* Human AI Tutor Interactive Character Avatar */}
        <HumanAITutor state={hasEndedCall ? 'ended' : 'ready'} size="md" className="my-1" />

        {/* Hero Title */}
        <h1 className="mb-1 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400 bg-clip-text text-transparent drop-shadow-sm">
            Shiksha AI
          </span>
          <span className="mt-0.5 inline-block ml-2 font-mono text-xl font-bold text-slate-300 sm:text-2xl">
            (शिक्षा AI)
          </span>
        </h1>

        {/* Day 4 Ready Badge */}
        <div className="mb-2 inline-flex items-center space-x-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-3 py-0.5 text-[11px] font-extrabold text-emerald-300 shadow-md">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {lang === 'hi'
              ? '🟢 स्टेट 1: एजेंट तैयार है (SQLite Memory Active)'
              : '🟢 Day 4: Persistent Memory & SQLite Active'}
          </span>
        </div>

        <p className="mb-1.5 max-w-xl text-base font-medium leading-snug text-amber-200/90 sm:text-xl">
          {lang === 'hi'
            ? 'भारत के लिए याददाश्त वाला Human AI वॉइस ट्यूटर'
            : 'Human-Type AI Voice Tutor with Persistent Memory & Consent'}
        </p>

        <p className="mb-4 max-w-lg text-xs font-normal leading-relaxed text-slate-300 sm:text-sm">
          {lang === 'hi'
            ? 'शिक्षा AI अब आपकी सीखने की प्रगति और नाम को SQLite डेटाबेस में सहेजती है और वापस आने पर स्वागत करती है।'
            : 'Shiksha AI now remembers learners across calls using SQLite database tools, respects user consent, and greets returning callers by name.'}
        </p>

        {/* Tab Navigation Controls */}
        <div className="mb-3 flex flex-wrap items-center justify-center gap-1 rounded-xl border border-white/10 bg-slate-900/80 p-1 text-xs font-semibold backdrop-blur-md">
          <button
            onClick={() => setActiveTab('day4memory')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'day4memory'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🧠 Day 4 Memory &amp; 2-Call Demo
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-sky-500 to-blue-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🌟 Overview
          </button>
          <button
            onClick={() => setActiveTab('states')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'states'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 5 Agent States
          </button>
          <button
            onClick={() => setActiveTab('guardrails')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'guardrails'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ Guardrails &amp; Consent
          </button>
        </div>

        {/* TAB 1: DAY 4 MEMORY & 2-CALL DEMO SCRIPT */}
        {activeTab === 'day4memory' && (
          <div className="mb-4 w-full space-y-2 text-left max-h-[220px] overflow-y-auto pr-1">
            <p className="mb-1 text-center font-mono text-[11px] text-amber-300">
              💡 Use these test scenarios to record your Day 4 video demonstration!
            </p>
            {day4MemoryDemoScript.map((item, idx) => (
              <div
                key={idx}
                className={`group relative rounded-xl border bg-gradient-to-r ${item.color} p-3 backdrop-blur-md transition-all`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="rounded-md border border-white/10 bg-slate-950/60 px-2 py-0.5 font-mono text-[10px] font-bold">
                    {item.scene}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-amber-300">{item.type}</span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-100 font-mono mb-0.5">
                  "{item.prompt}"
                </p>
                <p className="text-[11px] text-slate-300 font-sans italic mb-1.5">
                  ✨ Expected: {item.expectedOutcome}
                </p>
                {item.prompt && !item.prompt.startsWith('(') && (
                  <button
                    onClick={() => copyToClipboard(item.prompt, idx)}
                    className="inline-flex items-center space-x-1 rounded-md bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300 transition-all hover:bg-amber-500 hover:text-slate-950"
                  >
                    <span>{copiedIndex === idx ? '✓ Copied!' : '📋 Copy Prompt'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: OVERVIEW GRID */}
        {activeTab === 'overview' && (
          <div className="mb-4 grid w-full grid-cols-1 gap-2 text-left sm:grid-cols-3">
            <div className="group rounded-xl border border-white/10 bg-slate-900/70 p-3 backdrop-blur-md transition-all hover:border-amber-500/50">
              <div className="mb-1 flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                <span className="text-sm">🗄️</span>
                <span>SQLite Memory</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Saves caller name, study level, topics covered, struggles, and target goals in an embedded SQLite database.
              </p>
            </div>

            <div className="group rounded-xl border border-white/10 bg-slate-900/70 p-3 backdrop-blur-md transition-all hover:border-sky-400/50">
              <div className="mb-1 flex items-center space-x-1.5 text-xs font-bold text-sky-400">
                <span className="text-sm">🛠️</span>
                <span>Function Calling Tools</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                LLM invokes lookup_caller, save_caller_facts, and forget_caller tools dynamically without prompt hardcoding.
              </p>
            </div>

            <div className="group rounded-xl border border-white/10 bg-slate-900/70 p-3 backdrop-blur-md transition-all hover:border-emerald-400/50">
              <div className="mb-1 flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                <span className="text-sm">🔒</span>
                <span>Explicit User Consent</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Strictly asks caller permission before saving facts. If the caller declines, no data is stored.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: FIVE AGENT STATES */}
        {activeTab === 'states' && (
          <div className="mb-4 grid w-full grid-cols-1 gap-2 text-left sm:grid-cols-2">
            {agentStatesList.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-xl border ${item.color} p-2.5 backdrop-blur-md transition-all`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-[11px] font-extrabold">{item.state}</span>
                  <span className="text-[10px] font-bold">{item.badge}</span>
                </div>
                <p className="text-[11px] leading-snug text-slate-200">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: GUARDRAILS & CONSENT */}
        {activeTab === 'guardrails' && (
          <div className="mb-4 w-full space-y-2 text-left text-xs">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 backdrop-blur-md">
              <div className="mb-0.5 flex items-center space-x-2 font-bold text-emerald-300">
                <span>🔐 Explicit Caller Consent (Hard Rule)</span>
                <span className="ml-auto rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] text-emerald-300">
                  HARD RULE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Agent MUST ask: "क्या मैं आपका लर्निंग डेटा सेव कर लूँ?" before calling save_caller_facts. Drops data if caller says no.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 backdrop-blur-md">
              <div className="mb-0.5 flex items-center space-x-2 font-bold text-amber-300">
                <span>🔤 Native Devanagari Hindi Script</span>
                <span className="ml-auto rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-[9px] text-amber-300">
                  MULTILOCALE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Enforces native Devanagari script (नमस्ते) for clean Murf Falcon Indian accent voice synthesis.
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 backdrop-blur-md">
              <div className="mb-0.5 flex items-center space-x-2 font-bold text-rose-300">
                <span>🚫 Medical / Disability Refusal</span>
                <span className="ml-auto rounded-full border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 font-mono text-[9px] text-rose-300">
                  GUARDRAIL
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Refuses ADHD, Dyslexia or medical assessments with escalation script to certified experts.
              </p>
            </div>
          </div>
        )}

        {/* Start Button (State 1 & State 5 restart) */}
        <div className="group relative mt-1">
          <div className="absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-sky-400 opacity-75 blur-lg transition duration-500 group-hover:opacity-100 group-hover:duration-200" />

          <Button
            size="lg"
            onClick={onStartCall}
            className="relative h-14 w-72 border border-white/30 bg-gradient-to-r from-amber-500 via-orange-500 to-sky-500 font-mono text-sm sm:text-base font-black uppercase tracking-wider text-slate-950 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 sm:w-88"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2.5">
              <span className="size-2.5 animate-ping rounded-full bg-slate-950" />
              <span>{hasEndedCall ? (lang === 'hi' ? 'फिर से शुरू करें (Start Call 2)' : 'Start Call 2 (Test Returning Memory)') : (lang === 'hi' ? 'कॉल शुरू करें (Start Call 1)' : startButtonText)}</span>
              <svg
                className="size-5 transition-transform duration-300 group-hover:translate-x-1.5"
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
      <div className="z-10 mt-6 text-center font-mono text-[11px] text-slate-400 space-y-0.5">
        <p className="font-semibold text-slate-300">
          #VoiceForBharat • 10 Days of Voice Challenge (Day 4: Agent Memory &amp; SQLite Database)
        </p>
        <p>
          Built with{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://murf.ai"
            className="font-bold text-amber-300 underline underline-offset-2 hover:text-amber-200"
          >
            Murf Falcon TTS
          </a>
          , LiveKit Agents &amp; Gemini
        </p>
      </div>
    </div>
  );
};
