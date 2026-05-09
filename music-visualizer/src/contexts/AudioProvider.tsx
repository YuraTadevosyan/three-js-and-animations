import type { ReactNode } from 'react';

import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { AudioCtx } from '@/contexts/AudioContext';

export function AudioProvider({ children }: { children: ReactNode }) {
  const audio = useAudioAnalyser();
  return (
    <AudioCtx.Provider value={audio}>
      {children}
      {/* The audio element lives at the top of the tree so playback
          continues even when the visualizer route unmounts. */}
      <audio
        ref={audio.audioRef}
        crossOrigin="anonymous"
        preload="auto"
        className="hidden"
      />
    </AudioCtx.Provider>
  );
}
