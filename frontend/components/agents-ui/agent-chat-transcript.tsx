'use client';

import { type ComponentProps } from 'react';
import { AnimatePresence } from 'motion/react';
import { type AgentState, type ReceivedMessage } from '@livekit/components-react';
import { AgentChatIndicator } from '@/components/agents-ui/agent-chat-indicator';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { cn } from '@/lib/shadcn/utils';

export interface AgentChatTranscriptProps extends ComponentProps<'div'> {
  agentState?: AgentState;
  messages?: ReceivedMessage[];
  className?: string;
}

export function AgentChatTranscript({
  agentState,
  messages = [],
  className,
  ...props
}: AgentChatTranscriptProps) {
  return (
    <div className="relative mx-auto w-full max-w-2xl px-2 sm:px-4">
      {/* Sci-Fi Smart Classroom HUD Container */}
      <div className="relative rounded-3xl border border-sky-500/30 bg-slate-950/90 p-4 sm:p-6 shadow-2xl shadow-sky-500/20 backdrop-blur-2xl overflow-hidden school-grid-bg">
        
        {/* Top Sci-Fi HUD Header Bar */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
            </span>
            <span className="font-mono text-xs font-black tracking-widest text-sky-300 uppercase">
              ⚛️ SCI-FI SMART CLASSROOM HUD • SHIKSHA AI
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 font-mono text-[10px] text-amber-300">
            <span>🧬 SCIENCE &amp; LITERACY</span>
            <span className="text-slate-500">•</span>
            <span>E=mc²</span>
          </div>
        </div>

        {/* Ambient Floating Science & Academic Symbols */}
        <div className="pointer-events-none absolute top-4 left-6 text-xl text-sky-400/20 animate-pulse">
          ⚛️
        </div>
        <div className="pointer-events-none absolute bottom-8 right-6 text-xl text-amber-400/20 animate-pulse">
          🧬
        </div>
        <div className="pointer-events-none absolute top-1/2 right-4 text-xl text-emerald-400/20 animate-pulse">
          🪐
        </div>

        {/* Conversation Transcript Content */}
        <Conversation className={cn('relative z-10 max-h-[380px] overflow-y-auto space-y-4 pr-1', className)} {...props}>
          <ConversationContent>
            {messages.map((receivedMessage) => {
              const { id, timestamp, from, message } = receivedMessage;
              const isUser = from?.isLocal;
              const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={id}
                  className={cn(
                    'flex flex-col mb-3.5 transition-all duration-300',
                    isUser ? 'items-end' : 'items-start'
                  )}
                >
                  {/* Speaker Label */}
                  <div className="mb-1 flex items-center space-x-1.5 px-1 font-mono text-[10px] font-bold">
                    {isUser ? (
                      <span className="text-sky-300 flex items-center gap-1">
                        <span>👤 LEARNER (YOU)</span>
                        <span className="text-[9px] text-slate-500">{time}</span>
                      </span>
                    ) : (
                      <span className="text-amber-300 flex items-center gap-1">
                        <span>🎓 SHIKSHA AI (TEACHER)</span>
                        <span className="text-[9px] text-slate-500">{time}</span>
                      </span>
                    )}
                  </div>

                  {/* Glassmorphic Speech Bubble */}
                  <div
                    className={cn(
                      'max-w-[88%] rounded-2xl p-3.5 text-sm font-medium leading-relaxed shadow-lg backdrop-blur-md transition-all',
                      isUser
                        ? 'rounded-tr-xs border border-sky-400/40 bg-gradient-to-r from-sky-950/90 via-blue-950/90 to-indigo-950/90 text-sky-100 shadow-sky-500/10 font-sans'
                        : 'rounded-tl-xs border border-amber-400/40 bg-gradient-to-r from-amber-950/90 via-orange-950/90 to-slate-950/90 text-amber-100 shadow-amber-500/10 font-sans'
                    )}
                  >
                    {message}
                  </div>
                </div>
              );
            })}
            <AnimatePresence>
              {agentState === 'thinking' && (
                <div className="flex items-center space-x-2 py-2 text-xs font-mono text-amber-300">
                  <AgentChatIndicator size="sm" />
                  <span>Shiksha AI (Teacher) is thinking...</span>
                </div>
              )}
            </AnimatePresence>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>
    </div>
  );
}
