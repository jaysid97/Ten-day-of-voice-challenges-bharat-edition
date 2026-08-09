'use client';

import React from 'react';
import { cn } from '@/lib/shadcn/utils';

interface HumanAITutorProps {
  state?: 'ready' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'ended';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HumanAITutor({ state = 'ready', size = 'md', className }: HumanAITutorProps) {
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isConnecting = state === 'connecting';

  return (
    <div className={cn('relative flex flex-col items-center justify-center mb-2', className)}>
      {/* Outer Glowing Aura */}
      <div
        className={cn(
          'absolute rounded-full blur-2xl transition-all duration-700 pointer-events-none',
          size === 'sm' && 'size-32',
          size === 'md' && 'size-44',
          size === 'lg' && 'size-52',
          isSpeaking && 'bg-gradient-to-tr from-amber-500/40 via-orange-500/30 to-yellow-400/40 animate-pulse',
          isListening && 'bg-gradient-to-tr from-emerald-500/40 via-teal-500/30 to-sky-400/40 animate-pulse',
          isThinking && 'bg-gradient-to-tr from-purple-500/40 via-indigo-500/30 to-sky-400/40 animate-pulse',
          isConnecting && 'bg-gradient-to-tr from-sky-500/40 via-blue-500/30 to-indigo-400/40 animate-spin',
          (state === 'ready' || state === 'ended') && 'bg-gradient-to-tr from-amber-500/25 via-sky-500/20 to-emerald-500/25'
        )}
      />

      {/* Rotating Smart Classroom Chakra Halo Ring */}
      <div
        className={cn(
          'absolute rounded-full border border-amber-400/30 border-t-amber-400 border-r-sky-400 chakra-icon opacity-80 pointer-events-none',
          size === 'sm' && 'size-28',
          size === 'md' && 'size-36',
          size === 'lg' && 'size-40'
        )}
      />

      {/* Floating Academic Symbols Around Avatar */}
      <div className="absolute -top-2 -left-4 font-serif text-sm sm:text-base font-bold text-amber-300/40 float-symbol-1 pointer-events-none">
        📖
      </div>
      <div className="absolute -bottom-1 -right-4 font-mono text-xs sm:text-sm font-bold text-sky-300/40 float-symbol-2 pointer-events-none">
        ∑(x)
      </div>
      <div className="absolute -top-2 -right-4 font-serif text-sm sm:text-base font-bold text-emerald-300/40 float-symbol-3 pointer-events-none">
        ✏️
      </div>
      <div className="absolute -bottom-1 -left-4 font-mono text-xs sm:text-sm font-bold text-amber-300/40 float-symbol-4 pointer-events-none">
        A B C
      </div>

      {/* Human AI Tutor Avatar Card Frame */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full border-2 border-white/25 bg-slate-950/90 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:scale-105 hover:border-amber-400/70',
          size === 'sm' && 'size-20',
          size === 'md' && 'size-28',
          size === 'lg' && 'size-32'
        )}
      >
        {/* Human AI Character Face Graphic SVG */}
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            size === 'sm' && 'size-16',
            size === 'md' && 'size-22',
            size === 'lg' && 'size-26'
          )}
        >
          {/* Head Base Glow */}
          <circle cx="60" cy="60" r="50" fill="url(#avatarGlow)" fillOpacity="0.15" />

          {/* Academic Graduation Cap (Bharat Cyber EdTech) */}
          <path
            d="M60 18L18 34L60 50L102 34L60 18Z"
            fill="url(#gradCapGrad)"
            stroke="#F59E0B"
            strokeWidth="2"
          />
          <path d="M30 40V58C30 65 43.4 72 60 72C76.6 72 90 65 90 58V40" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M92 36V55" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="92" cy="57" r="2.5" fill="#38BDF8" />

          {/* Friendly Eyebrows */}
          <path d="M38 52C42 49 48 49 52 52" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M68 52C72 49 78 49 82 52" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" />

          {/* Animated Expressive Eyes */}
          <g className={cn(isThinking && 'animate-pulse')}>
            <circle cx="45" cy="60" r="6" fill="#38BDF8" />
            <circle cx="75" cy="60" r="6" fill="#38BDF8" />
            <circle cx="47" cy="58" r="2" fill="white" />
            <circle cx="77" cy="58" r="2" fill="white" />
          </g>

          {/* Smart Classroom Glasses */}
          <rect x="36" y="53" width="18" height="14" rx="4" stroke="#F59E0B" strokeWidth="2" fill="none" />
          <rect x="66" y="53" width="18" height="14" rx="4" stroke="#F59E0B" strokeWidth="2" fill="none" />
          <line x1="54" y1="60" x2="66" y2="60" stroke="#F59E0B" strokeWidth="2" />

          {/* Dynamic Mouth / Spoken Waveform Equalizer */}
          {isSpeaking ? (
            <g className="animate-pulse">
              <line x1="44" y1="80" x2="44" y2="86" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              <line x1="52" y1="76" x2="52" y2="90" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="60" y1="74" x2="60" y2="92" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
              <line x1="68" y1="76" x2="68" y2="90" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="76" y1="80" x2="76" y2="86" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : isListening ? (
            <path
              d="M48 80C48 86 72 86 72 80"
              stroke="#10B981"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              className="animate-pulse"
            />
          ) : (
            <path
              d="M46 79C52 85 68 85 74 79"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* SVG Gradients */}
          <defs>
            <linearGradient id="gradCapGrad" x1="18" y1="18" x2="102" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D97706" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
            <radialGradient id="avatarGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 60) scale(50)">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* State Indicator Floating Badge */}
        <div className="absolute -bottom-1.5 rounded-full border border-white/20 bg-slate-900/90 px-2 py-0.5 shadow-md backdrop-blur-md">
          <span className="font-mono text-[9px] font-extrabold uppercase text-amber-300">
            {isSpeaking
              ? '🔊 SPEAKING'
              : isListening
                ? '🎤 LISTENING'
                : isThinking
                  ? '💭 THINKING'
                  : isConnecting
                    ? '🟡 CONNECTING'
                    : 'HUMAN AI TUTOR'}
          </span>
        </div>
      </div>
    </div>
  );
}
