'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

interface MicrophoneErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  errorMessage?: string;
  language?: 'en' | 'hi';
}

export function MicrophoneErrorModal({
  isOpen,
  onClose,
  onRetry,
  errorMessage,
  language = 'en',
}: MicrophoneErrorModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/40 bg-slate-900/95 p-6 shadow-2xl shadow-rose-950/50 text-slate-100"
        >
          {/* Top Decorative Alert Bar */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

          {/* Warning Icon Header */}
          <div className="mb-4 flex items-center space-x-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-950/60 text-2xl text-rose-400 shadow-inner">
              🎙️❌
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-rose-300">
                {language === 'hi'
                  ? 'माइक्रोफ़ोन एक्सेस अस्वीकृत (Mic Denied)'
                  : 'Microphone Access Denied'}
              </h3>
              <p className="text-xs font-medium text-slate-400">
                {language === 'hi'
                  ? 'Shiksha AI को आपकी आवाज़ सुनने के लिए माइक चाहिए'
                  : 'Shiksha AI requires microphone access to hear your voice'}
              </p>
            </div>
          </div>

          {/* Description & Technical Error details */}
          <div className="mb-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs space-y-2 leading-relaxed text-slate-300">
            <p>
              {language === 'hi'
                ? 'आपने इस वेबसाइट के लिए माइक्रोफ़ोन एक्सेस को ब्लॉक कर दिया है या अनुमति नहीं दी है।'
                : 'Microphone access was blocked or permission was revoked in your browser settings.'}
            </p>

            {errorMessage && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-950/30 p-2 font-mono text-[11px] text-rose-300">
                Error: {errorMessage}
              </div>
            )}

            {/* How to Fix Step-by-Step Guide */}
            <div className="pt-2 border-t border-white/10 space-y-1.5 font-sans">
              <p className="font-bold text-amber-300">
                {language === 'hi' ? 'इसे कैसे ठीक करें:' : 'How to enable microphone access:'}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>
                  {language === 'hi'
                    ? 'ब्राउज़र एड्रेस बार में लॉक/आइकन (🔒) पर क्लिक करें।'
                    : 'Click the lock/settings icon (🔒) in your browser URL address bar.'}
                </li>
                <li>
                  {language === 'hi'
                    ? 'Microphone (माइक्रोफ़ोन) को "Allow" (अनुमति दें) पर सेट करें।'
                    : 'Toggle the Microphone permission setting to "Allow".'}
                </li>
                <li>
                  {language === 'hi'
                    ? 'नीचे "Retry Connection" बटन दबाएं या पेज को रिफ्रेश करें।'
                    : 'Click the "Retry Connection" button below or refresh the page.'}
                </li>
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-white/20 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              {language === 'hi' ? 'बंद करें (Dismiss)' : 'Dismiss'}
            </Button>
            {onRetry && (
              <Button
                size="sm"
                onClick={onRetry}
                className="border border-amber-400/50 bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-slate-950 shadow-lg hover:from-amber-400 hover:to-orange-400"
              >
                {language === 'hi' ? '🔄 पुनः प्रयास करें (Retry)' : '🔄 Retry Connection'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
