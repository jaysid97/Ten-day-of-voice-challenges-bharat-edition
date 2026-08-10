'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAgent, useSessionContext } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

interface AgentStateHeaderProps {
  language?: 'en' | 'hi';
  onToggleLanguage?: () => void;
  className?: string;
  micError?: string | null;
  onShowMicError?: () => void;
}

export function AgentStateHeader({
  language = 'en',
  onToggleLanguage,
  className,
  micError,
  onShowMicError,
}: AgentStateHeaderProps) {
  const { state: agentState } = useAgent();
  const session = useSessionContext();

  const isConnecting =
    session.connectionState === 'connecting' ||
    agentState === 'connecting' ||
    agentState === 'initializing';

  const isListening = agentState === 'listening';
  const isSpeaking = agentState === 'speaking';
  const isThinking = agentState === 'thinking';
  const isDisconnected = session.connectionState === 'disconnected';

  return (
    <header className={cn('relative z-40 mx-auto w-full max-w-3xl px-4 pt-4', className)}>
      <div className="flex items-center justify-between gap-2.5 rounded-3xl border border-white/15 bg-slate-900/85 p-3.5 shadow-2xl backdrop-blur-2xl">
        {/* Left: Identity Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-sky-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <span className="text-lg">📚</span>
            <span className="absolute -bottom-1 -right-1 flex size-3">
              <span
                className={cn(
                  'relative inline-flex size-3 rounded-full',
                  isSpeaking && 'bg-amber-400 animate-ping',
                  isListening && 'bg-emerald-400 animate-ping',
                  isConnecting && 'bg-sky-400 animate-spin',
                  isThinking && 'bg-purple-400 animate-pulse'
                )}
              />
            </span>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-black tracking-tight text-white sm:text-base">
              <span>Shiksha AI</span>
              <span className="rounded-md border border-amber-500/40 bg-amber-950/60 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-amber-300">
                DAY 5 • REAL DOMAIN TOOLS &amp; MULTI-SUBJECT
              </span>
            </h2>
            <p className="text-[11px] font-medium text-slate-400">
              {language === 'hi' ? 'पर्सनल वॉइस ट्यूटर • Murf Falcon' : 'Personal Voice Tutor • Murf Falcon'}
            </p>
          </div>
        </div>

        {/* Center: Live 5 Agent States Banner */}
        <div className="flex flex-1 justify-center max-w-md">
          <AnimatePresence mode="wait">
            {isConnecting && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-950/80 px-4 py-1.5 text-xs font-bold text-sky-300 shadow-lg shadow-sky-950/60"
              >
                <span className="size-2.5 rounded-full bg-sky-400 animate-ping" />
                <span className="font-mono">
                  {language === 'hi'
                    ? '🟡 जोड़ रहे हैं... कृपया प्रतीक्षा करें (Connecting)'
                    : '🟡 Connecting... Please wait'}
                </span>
              </motion.div>
            )}

            {isListening && (
              <motion.div
                key="listening"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-950/90 px-4 py-1.5 text-xs font-bold text-emerald-300 shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-500/20"
              >
                <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono">
                  {language === 'hi'
                    ? '🟢 🎤 आपकी बात सुन रहे हैं (Listening)'
                    : '🟢 🎤 Listening to you...'}
                </span>
              </motion.div>
            )}

            {isThinking && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-950/90 px-4 py-1.5 text-xs font-bold text-purple-300 shadow-xl shadow-purple-950/60"
              >
                <span className="size-2.5 rounded-full bg-purple-400 animate-ping" />
                <span className="font-mono">
                  {language === 'hi'
                    ? '🟣 🧠 सोच रहे हैं... (Thinking)'
                    : '🟣 🧠 Shiksha AI is thinking...'}
                </span>
              </motion.div>
            )}

            {isSpeaking && (
              <motion.div
                key="speaking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/60 bg-amber-950/90 px-4 py-1.5 text-xs font-bold text-amber-300 shadow-xl shadow-amber-950/70 ring-2 ring-amber-500/20"
              >
                <span className="size-2.5 rounded-full bg-amber-400 animate-bounce" />
                <span className="font-mono">
                  {language === 'hi'
                    ? '🟠 🔊 Shiksha AI बोल रही है (Speaking)'
                    : '🟠 🔊 Shiksha AI is speaking...'}
                </span>
              </motion.div>
            )}

            {isDisconnected && (
              <motion.div
                key="disconnected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-rose-500/50 bg-rose-950/80 px-4 py-1.5 text-xs font-bold text-rose-300 shadow-lg shadow-rose-950/50"
              >
                <span className="size-2.5 rounded-full bg-rose-400" />
                <span className="font-mono">
                  {language === 'hi'
                    ? '🔴 कॉल समाप्त (Call ended)'
                    : '🔴 Call ended — Click Start Again'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Controls: Mic Warning Trigger & Language Toggle */}
        <div className="flex items-center gap-2">
          {micError && onShowMicError && (
            <button
              onClick={onShowMicError}
              className="flex items-center space-x-1 animate-pulse rounded-xl border border-rose-500/50 bg-rose-950/70 px-2.5 py-1 text-xs font-bold text-rose-300 hover:bg-rose-900/80 transition-all"
              title="Microphone Error Details"
            >
              <span>🎙️⚠️</span>
              <span className="hidden sm:inline">Mic Warning</span>
            </button>
          )}

          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="rounded-xl border border-white/20 bg-slate-800/90 px-3 py-1 text-xs font-bold text-amber-300 transition-all hover:bg-slate-700 hover:text-amber-200 active:scale-95 shadow-md"
              title="Toggle Language"
            >
              {language === 'en' ? '🇮🇳 हिन्दी' : '🌐 EN'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
