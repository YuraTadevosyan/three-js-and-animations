import { createContext, useContext } from 'react';

import type { UseAudioAnalyser } from '@/hooks/useAudioAnalyser';

export const AudioCtx = createContext<UseAudioAnalyser | null>(null);

export function useAudio(): UseAudioAnalyser {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error('useAudio must be used inside <AudioProvider>');
  }
  return ctx;
}
