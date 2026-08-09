'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, type MotionProps, motion } from 'motion/react';
import { useAgent, useSessionContext, useSessionMessages } from '@livekit/components-react';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { AgentStateHeader } from '@/components/agents-ui/agent-state-header';
import { MicrophoneErrorModal } from '@/components/agents-ui/microphone-error-modal';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { cn } from '@/lib/shadcn/utils';
import { TileLayout } from './tile-view';

const MotionMessage = motion.create(Shimmer);

const BOTTOM_VIEW_MOTION_PROPS: MotionProps = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

const CHAT_MOTION_PROPS: MotionProps = {
  variants: {
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeOut',
        duration: 0.3,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        ease: 'easeOut',
        duration: 0.3,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const SHIMMER_MOTION_PROPS: MotionProps = {
  variants: {
    visible: {
      opacity: 1,
      transition: {
        ease: 'easeIn',
        duration: 0.5,
        delay: 0.8,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeIn',
        duration: 0.5,
        delay: 0,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

export interface AgentSessionView_01Props {
  preConnectMessage?: string;
  supportsChatInput?: boolean;
  supportsVideoInput?: boolean;
  supportsScreenShare?: boolean;
  isPreConnectBufferEnabled?: boolean;

  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;
  className?: string;
}

export function AgentSessionView_01({
  preConnectMessage = 'Shiksha AI is listening, speak or ask a study question',
  supportsChatInput = true,
  supportsVideoInput = true,
  supportsScreenShare = true,
  isPreConnectBufferEnabled = true,

  audioVisualizerType,
  audioVisualizerColor,
  audioVisualizerColorShift,
  audioVisualizerBarCount,
  audioVisualizerGridRowCount,
  audioVisualizerGridColumnCount,
  audioVisualizerRadialBarCount,
  audioVisualizerRadialRadius,
  audioVisualizerWaveLineWidth,
  ref,
  className,
  ...props
}: React.ComponentProps<'section'> & AgentSessionView_01Props) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [micError, setMicError] = useState<string | null>(null);
  const [isMicModalOpen, setIsMicModalOpen] = useState<boolean>(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { state: agentState } = useAgent();

  const controls: AgentControlBarControls = {
    leave: true,
    microphone: true,
    chat: supportsChatInput,
    camera: supportsVideoInput,
    screenShare: supportsScreenShare,
  };

  const handleDeviceError = ({ source, error }: { source: Track.Source; error: Error }) => {
    if (source === Track.Source.Microphone) {
      console.warn('Microphone error detected:', error);
      setMicError(error.message || 'Permission denied or microphone unavailable');
      setIsMicModalOpen(true);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setChatOpen(true);
    }
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section
      ref={ref}
      className={cn('bg-background relative z-10 h-full w-full overflow-hidden school-grid-bg', className)}
      {...props}
    >
      {/* Cyber Saffron-Cyan Tricolor Top Accent Line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF9933] via-sky-400 to-[#138808] opacity-80 z-20" />

      {/* Ambient Futuristic Smart Classroom Spotlight Glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 size-[550px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-500/10 via-sky-500/10 to-emerald-500/10 blur-[130px]" />

      {/* Top Header showing the Agent States */}
      <AgentStateHeader
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'hi' : 'en'))}
        micError={micError}
        onShowMicError={() => setIsMicModalOpen(true)}
      />

      {/* Microphone Permission Modal */}
      <MicrophoneErrorModal
        isOpen={isMicModalOpen}
        onClose={() => setIsMicModalOpen(false)}
        onRetry={() => {
          setIsMicModalOpen(false);
          setMicError(null);
        }}
        errorMessage={micError ?? undefined}
        language={language}
      />

      <Fade top className="absolute inset-x-4 top-0 z-10 h-40" />

      {/* Transcript view */}
      <div className="absolute top-20 bottom-[120px] z-40 flex w-full flex-col md:bottom-[140px]">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              {...CHAT_MOTION_PROPS}
              className="flex h-full w-full flex-col gap-4 space-y-3 transition-opacity duration-300 ease-out"
            >
              <AgentChatTranscript
                agentState={agentState}
                messages={messages}
                className="mx-auto w-full max-w-2xl [&_.is-user>div]:rounded-[22px] [&>div>div]:px-4 [&>div>div]:pt-32 md:[&>div>div]:px-6"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tile layout with Audio Visualizer & Futuristic Teacher Avatar */}
      <TileLayout
        chatOpen={chatOpen}
        audioVisualizerType={audioVisualizerType}
        audioVisualizerColor={audioVisualizerColor}
        audioVisualizerColorShift={audioVisualizerColorShift}
        audioVisualizerBarCount={audioVisualizerBarCount}
        audioVisualizerRadialBarCount={audioVisualizerRadialBarCount}
        audioVisualizerRadialRadius={audioVisualizerRadialRadius}
        audioVisualizerGridRowCount={audioVisualizerGridRowCount}
        audioVisualizerGridColumnCount={audioVisualizerGridColumnCount}
        audioVisualizerWaveLineWidth={audioVisualizerWaveLineWidth}
      />

      {/* Bottom Control Bar */}
      <motion.div
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="absolute inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {/* Pre-connect message */}
        {isPreConnectBufferEnabled && (
          <AnimatePresence>
            {messages.length === 0 && (
              <MotionMessage
                key="pre-connect-message"
                duration={2}
                aria-hidden={messages.length > 0}
                {...SHIMMER_MOTION_PROPS}
                className="pointer-events-none mx-auto block w-full max-w-2xl pb-4 text-center text-xs sm:text-sm font-semibold text-amber-300 font-mono tracking-wide"
              >
                {language === 'hi'
                  ? '🎓 शिक्षा AI (Shiksha AI) आपकी बात सुन रही है, सवाल पूछें या अभ्यास करें'
                  : '🎓 Shiksha AI is listening, speak or ask a study topic'}
              </MotionMessage>
            )}
          </AnimatePresence>
        )}

        <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12 border border-white/10 rounded-2xl p-2 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar
            variant="livekit"
            controls={controls}
            isChatOpen={chatOpen}
            isConnected={session.isConnected}
            onDisconnect={session.end}
            onIsChatOpenChange={setChatOpen}
            onDeviceError={handleDeviceError}
          />
        </div>
      </motion.div>
    </section>
  );
}
