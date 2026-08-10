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
      <div className="absolute -top-2 -left-4 font-serif text-sm sm:text-base font-bold text-amber-300/50 float-symbol-1 pointer-events-none">
        📖
      </div>
      <div className="absolute -bottom-1 -right-4 font-mono text-xs sm:text-sm font-bold text-sky-300/50 float-symbol-2 pointer-events-none">
        ∑(x)
      </div>
      <div className="absolute -top-2 -right-4 font-serif text-sm sm:text-base font-bold text-emerald-300/50 float-symbol-3 pointer-events-none">
        ✏️
      </div>
      <div className="absolute -bottom-1 -left-4 font-mono text-xs sm:text-sm font-bold text-amber-300/50 float-symbol-4 pointer-events-none">
        A B C
      </div>

      {/* Human AI Tutor Avatar Card Frame */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full border-2 border-amber-400/40 bg-slate-950/90 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:scale-105 hover:border-amber-400/80',
          size === 'sm' && 'size-20',
          size === 'md' && 'size-28',
          size === 'lg' && 'size-32'
        )}
      >
        {/* Human AI Character Face Graphic SVG with Silky Smooth Skin Shading */}
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
          <circle cx="60" cy="60" r="52" fill="url(#avatarGlow)" fillOpacity="0.2" />

          {/* Smooth Human Skin Face Base Contour */}
          <ellipse cx="60" cy="64" rx="34" ry="38" fill="url(#smoothSkinGrad)" />
          {/* Soft Natural Face Cheek Blush */}
          <circle cx="40" cy="68" r="8" fill="url(#blushGrad)" opacity="0.45" />
          <circle cx="80" cy="68" r="8" fill="url(#blushGrad)" opacity="0.45" />
          {/* Chin & Jaw Ambient Soft Lighting Shadow */}
          <path d="M38 78C48 88 72 88 82 78C76 92 44 92 38 78Z" fill="#D98A6C" opacity="0.3" />

          {/* Academic Graduation Cap (Bharat Cyber EdTech) */}
          <path
            d="M60 16L16 32L60 48L104 32L60 16Z"
            fill="url(#gradCapGrad)"
            stroke="#F59E0B"
            strokeWidth="2"
          />
          <path d="M28 38V56C28 63 42 70 60 70C78 70 92 63 92 56V38" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M94 34V54" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="94" cy="56" r="2.5" fill="#38BDF8" />

          {/* Friendly Smooth Eyebrows */}
          <path d="M38 50C43 47 49 47 53 50" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M67 50C71 47 77 47 82 50" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />

          {/* Expressive Eyes withspecular Highlights */}
          <g className={cn(isThinking && 'animate-pulse')}>
            {/* Eye Sclera & Iris */}
            <circle cx="45" cy="58" r="6.5" fill="#0284C7" />
            <circle cx="75" cy="58" r="6.5" fill="#0284C7" />
            <circle cx="45" cy="58" r="3.5" fill="#0F172A" />
            <circle cx="75" cy="58" r="3.5" fill="#0F172A" />
            {/* Specular Catchlight Highlights */}
            <circle cx="47" cy="56" r="2" fill="#FFFFFF" />
            <circle cx="77" cy="56" r="2" fill="#FFFFFF" />
          </g>

          {/* Polished Smart Glasses with Amber Metallic Sheen */}
          <rect x="35" y="51" width="20" height="15" rx="4" stroke="#F59E0B" strokeWidth="2.2" fill="none" />
          <rect x="65" y="51" width="20" height="15" rx="4" stroke="#F59E0B" strokeWidth="2.2" fill="none" />
          <line x1="55" y1="58" x2="65" y2="58" stroke="#F59E0B" strokeWidth="2" />

          {/* Dynamic Mouth / Spoken Waveform Equalizer */}
          {isSpeaking ? (
            <g className="animate-pulse">
              <line x1="44" y1="78" x2="44" y2="84" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              <line x1="52" y1="74" x2="52" y2="88" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="60" y1="72" x2="60" y2="90" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
              <line x1="68" y1="74" x2="68" y2="88" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="76" y1="78" x2="76" y2="84" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : isListening ? (
            <path
              d="M48 78C48 84 72 84 72 78"
              stroke="#10B981"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              className="animate-pulse"
            />
          ) : (
            <path
              d="M46 77C52 83 68 83 74 77"
              stroke="#B45309"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* SVG Definitions for Silky Smooth Skin & Cap Gradients */}
          <defs>
            {/* Silky Smooth Skin Gradient */}
            <linearGradient id="smoothSkinGrad" x1="60" y1="26" x2="60" y2="102" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF0E5" />
              <stop offset="50%" stopColor="#F9D7C2" />
              <stop offset="100%" stopColor="#E5AB8B" />
            </linearGradient>

            {/* Cheek Blush Gradient */}
            <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF7A85" />
              <stop offset="100%" stopColor="#FF7A85" stopOpacity="0" />
            </radialGradient>

            {/* Graduation Cap Gradient */}
            <linearGradient id="gradCapGrad" x1="16" y1="16" x2="104" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D97706" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>

            {/* Background Avatar Glow */}
            <radialGradient id="avatarGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 60) scale(52)">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* State Indicator Floating Badge */}
        <div className="absolute -bottom-1.5 rounded-full border border-amber-400/40 bg-slate-900/90 px-2.5 py-0.5 shadow-lg backdrop-blur-md">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-wide text-amber-300">
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
