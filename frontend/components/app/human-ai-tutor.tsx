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
    <div className={cn('relative flex flex-col items-center justify-center mb-4', className)}>
      {/* Outer Glowing Aura */}
      <div
        className={cn(
          'absolute rounded-full blur-3xl transition-all duration-700 pointer-events-none',
          size === 'lg' ? 'size-72' : 'size-52',
          isSpeaking && 'bg-gradient-to-tr from-amber-500/40 via-orange-500/30 to-yellow-400/40 animate-pulse',
          isListening && 'bg-gradient-to-tr from-emerald-500/40 via-teal-500/30 to-sky-400/40 animate-pulse',
          isThinking && 'bg-gradient-to-tr from-purple-500/40 via-indigo-500/30 to-sky-400/40 animate-pulse',
          isConnecting && 'bg-gradient-to-tr from-sky-500/40 via-blue-500/30 to-indigo-400/40 animate-spin',
          (state === 'ready' || state === 'ended') && 'bg-gradient-to-tr from-amber-500/25 via-sky-500/20 to-emerald-500/25'
        )}
      />

      {/* Rotating Smart Classroom Chakra Halo Ring */}
      <div className="absolute size-44 rounded-full border border-amber-400/30 border-t-amber-400 border-r-sky-400 chakra-icon opacity-80 pointer-events-none" />

      {/* Floating Academic Symbols Around Avatar */}
      <div className="absolute -top-3 -left-6 font-serif text-lg font-bold text-amber-300/40 float-symbol-1 pointer-events-none">
        📖
      </div>
      <div className="absolute -bottom-2 -right-6 font-mono text-lg font-bold text-sky-300/40 float-symbol-2 pointer-events-none">
        ∑(x)
      </div>
      <div className="absolute -top-3 -right-6 font-serif text-lg font-bold text-emerald-300/40 float-symbol-3 pointer-events-none">
        ✏️
      </div>
      <div className="absolute -bottom-2 -left-6 font-mono text-lg font-bold text-amber-300/40 float-symbol-4 pointer-events-none">
        A B C
      </div>

      {/* Human AI Tutor Avatar Card Frame */}
      <div className="relative flex size-36 items-center justify-center rounded-full border-2 border-white/25 bg-slate-950/90 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:scale-105 hover:border-amber-400/70">
        
        {/* Human AI Character Face Graphic SVG */}
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-28"
        >
          {/* Head Base Glow */}
          <circle cx="60" cy="60" r="50" fill="url(#tutor_head_grad)" opacity="0.15" />
          
          {/* Human AI Head & Neck Base */}
          <path
            d="M60 24C43 24 32 37 32 54C32 71 43 84 60 84C77 84 88 71 88 54C88 37 77 24 60 24Z"
            fill="url(#tutor_skin_grad)"
            stroke="url(#tutor_border_grad)"
            strokeWidth="2.2"
          />

          {/* Smart AI Headset / Glasses Frame */}
          <path
            d="M36 47C36 44 39 42 42 42H78C81 42 84 44 84 47V52C84 55 81 57 78 57H42C39 57 36 55 36 47Z"
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth="1.8"
            opacity="0.95"
          />
          <line x1="28" y1="49" x2="36" y2="49" stroke="#38BDF8" strokeWidth="2" />
          <line x1="84" y1="49" x2="92" y2="49" stroke="#38BDF8" strokeWidth="2" />
          
          {/* Digital AI Eyes (Animated Blinking/Pulse) */}
          <g>
            {/* Left Eye */}
            <circle cx="48" cy="49" r="4.5" fill="#38BDF8" className={cn(isListening && 'animate-ping')} />
            <circle cx="48" cy="49" r="2" fill="#FFFFFF" />
            
            {/* Right Eye */}
            <circle cx="72" cy="49" r="4.5" fill="#38BDF8" className={cn(isListening && 'animate-ping')} />
            <circle cx="72" cy="49" r="2" fill="#FFFFFF" />
          </g>

          {/* AI Tutor Warm Smile Curve when not speaking */}
          {!isSpeaking && (
            <path
              d="M48 67C53 72 67 72 72 67"
              stroke="#FF9933"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Dynamic Voice Equalizer Mouth Bars when Speaking */}
          {isSpeaking && (
            <g className="animate-pulse">
              <rect x="44" y="65" width="3.5" height="11" rx="1.75" fill="#FF9933" />
              <rect x="51" y="62" width="3.5" height="17" rx="1.75" fill="#F59E0B" />
              <rect x="58" y="59" width="4" height="22" rx="2" fill="#38BDF8" />
              <rect x="66" y="62" width="3.5" height="17" rx="1.75" fill="#F59E0B" />
              <rect x="73" y="65" width="3.5" height="11" rx="1.75" fill="#FF9933" />
            </g>
          )}

          {/* Smart Teacher Graduation Cap */}
          <path
            d="M60 12L28 26L60 40L92 26L60 12Z"
            fill="url(#cap_grad)"
            stroke="#FF9933"
            strokeWidth="1.8"
          />
          <path
            d="M92 26V36"
            stroke="#FF9933"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="92" cy="38" r="2.5" fill="#FF9933" />

          {/* Color Gradients */}
          <defs>
            <linearGradient id="tutor_head_grad" x1="0" y1="0" x2="120" y2="120">
              <stop stopColor="#FF9933" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="tutor_skin_grad" x1="32" y1="24" x2="88" y2="84">
              <stop stopColor="#1E293B" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="tutor_border_grad" x1="32" y1="24" x2="88" y2="84">
              <stop stopColor="#FF9933" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="cap_grad" x1="28" y1="12" x2="92" y2="40">
              <stop stopColor="#FF9933" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>

        {/* Human AI Tutor Identity Badge */}
        <div className="absolute -bottom-2.5 inline-flex items-center space-x-1.5 rounded-full border border-white/20 bg-slate-900/90 px-3 py-0.5 text-[11px] font-extrabold shadow-lg backdrop-blur-md">
          <span
            className={cn(
              'size-2 rounded-full',
              isSpeaking && 'bg-amber-400 animate-ping',
              isListening && 'bg-emerald-400 animate-ping',
              isThinking && 'bg-purple-400 animate-pulse',
              isConnecting && 'bg-sky-400 animate-spin',
              (state === 'ready' || state === 'ended') && 'bg-emerald-400'
            )}
          />
          <span className="font-mono text-slate-200 uppercase tracking-wider">
            {state === 'speaking'
              ? 'SHIKSHA AI SPEAKING'
              : state === 'listening'
                ? 'LISTENING TO YOU'
                : state === 'thinking'
                  ? 'THINKING'
                  : state === 'connecting'
                    ? 'CONNECTING'
                    : 'HUMAN AI TUTOR'}
          </span>
        </div>
      </div>
    </div>
  );
}
