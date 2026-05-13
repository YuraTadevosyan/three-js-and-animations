import { useCallback, useEffect, useRef, useState } from 'react';
import jsmediatags from 'jsmediatags';
import type { TagType } from 'jsmediatags/types';

const FFT_SIZE = 1024;
const SMOOTHING = 0.82;

const BASS_BAND: [number, number] = [0, 8];
const MID_BAND: [number, number] = [9, 48];
const HIGH_BAND: [number, number] = [49, 160];

const BEAT_THRESHOLD = 1.32;
const BEAT_REFRACTORY_MS = 280;

export interface AudioAnalysis {
  bass: number;
  mid: number;
  high: number;
  level: number;
  beat: boolean;
  beatStrength: number;
  freq: Uint8Array;
  time: Uint8Array;
}

export type InputMode = 'element' | 'mic';

export interface UseAudioAnalyser {
  audioRef: React.RefObject<HTMLAudioElement>;
  analysisRef: React.MutableRefObject<AudioAnalysis>;
  fileName: string | null;
  isPlaying: boolean;
  isReady: boolean;
  duration: number;
  volume: number;
  muted: boolean;
  loop: boolean;
  error: string | null;
  inputMode: InputMode;
  trackTitle: string | null;
  trackArtist: string | null;
  trackCover: string | null;
  loadFile: (file: File) => void;
  loadUrl: (url: string) => void;
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  restart: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  dismissError: () => void;
  enableMic: () => Promise<void>;
  disableMic: () => void;
  getRecordingAudioStream: () => MediaStream | null;
  sampleAnalysis: () => AudioAnalysis;
}

function bandAverage(arr: Uint8Array, [start, end]: [number, number]): number {
  const lo = Math.max(0, start);
  const hi = Math.min(arr.length - 1, end);
  if (hi < lo) return 0;
  let sum = 0;
  for (let i = lo; i <= hi; i++) sum += arr[i];
  return sum / (hi - lo + 1) / 255;
}

function pictureToDataUrl(picture: {
  data: number[];
  format: string;
}): string {
  let binary = '';
  for (let i = 0; i < picture.data.length; i++) {
    binary += String.fromCharCode(picture.data[i]);
  }
  return `data:${picture.format};base64,${btoa(binary)}`;
}

function readMetadata(file: File): Promise<TagType['tags'] | null> {
  return new Promise((resolve) => {
    jsmediatags.read(file, {
      onSuccess: (result) => resolve(result.tags),
      onError: () => resolve(null),
    });
  });
}

export function useAudioAnalyser(): UseAudioAnalyser {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const elementSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordingDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const freqRef = useRef(new Uint8Array(new ArrayBuffer(FFT_SIZE / 2)));
  const timeRef = useRef(new Uint8Array(new ArrayBuffer(FFT_SIZE / 2)));
  const bassEnergyAvgRef = useRef(0);
  const lastBeatRef = useRef(0);
  const blobUrlRef = useRef<string | null>(null);

  const analysisRef = useRef<AudioAnalysis>({
    bass: 0,
    mid: 0,
    high: 0,
    level: 0,
    beat: false,
    beatStrength: 0,
    freq: freqRef.current,
    time: timeRef.current,
  });

  const [fileName, setFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('element');
  const [trackTitle, setTrackTitle] = useState<string | null>(null);
  const [trackArtist, setTrackArtist] = useState<string | null>(null);
  const [trackCover, setTrackCover] = useState<string | null>(null);

  const ensureCtx = useCallback((): AudioContext | null => {
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  }, []);

  const ensureAnalyser = useCallback((): AnalyserNode | null => {
    const ctx = ensureCtx();
    if (!ctx) return null;
    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = SMOOTHING;
      analyserRef.current = analyser;
    }
    return analyserRef.current;
  }, [ensureCtx]);

  // Wire up the audio element → analyser → speakers path. Idempotent.
  const ensureElementGraph = useCallback(() => {
    const audio = audioRef.current;
    const ctx = ensureCtx();
    const analyser = ensureAnalyser();
    if (!audio || !ctx || !analyser) return;
    if (!elementSourceRef.current) {
      elementSourceRef.current = ctx.createMediaElementSource(audio);
    }
    elementSourceRef.current.disconnect();
    elementSourceRef.current.connect(analyser);
    analyser.disconnect();
    analyser.connect(ctx.destination);
    if (recordingDestRef.current) analyser.connect(recordingDestRef.current);
  }, [ensureAnalyser, ensureCtx]);

  const sampleAnalysis = useCallback((): AudioAnalysis => {
    const analyser = analyserRef.current;
    const out = analysisRef.current;
    if (!analyser) {
      out.bass = out.mid = out.high = out.level = 0;
      out.beat = false;
      out.beatStrength = 0;
      return out;
    }
    analyser.getByteFrequencyData(freqRef.current);
    analyser.getByteTimeDomainData(timeRef.current);

    const bass = bandAverage(freqRef.current, BASS_BAND);
    const mid = bandAverage(freqRef.current, MID_BAND);
    const high = bandAverage(freqRef.current, HIGH_BAND);
    const level = bass * 0.55 + mid * 0.3 + high * 0.15;

    bassEnergyAvgRef.current = bassEnergyAvgRef.current * 0.92 + bass * 0.08;
    const now = performance.now();
    const exceeds =
      bass > bassEnergyAvgRef.current * BEAT_THRESHOLD && bass > 0.18;
    const cooled = now - lastBeatRef.current > BEAT_REFRACTORY_MS;
    const beat = exceeds && cooled;
    if (beat) lastBeatRef.current = now;

    const beatStrength = Math.max(
      0,
      Math.min(
        1,
        (bass - bassEnergyAvgRef.current) /
          Math.max(0.05, bassEnergyAvgRef.current),
      ),
    );

    out.bass = bass;
    out.mid = mid;
    out.high = high;
    out.level = level;
    out.beat = beat;
    out.beatStrength = beatStrength;
    return out;
  }, []);

  const clearMetadata = useCallback(() => {
    setTrackTitle(null);
    setTrackArtist(null);
    setTrackCover(null);
  }, []);

  const loadFile = useCallback(
    async (file: File) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      audio.src = url;
      audio.load();
      setFileName(file.name);
      setIsReady(false);
      setIsPlaying(false);
      setError(null);
      clearMetadata();

      const tags = await readMetadata(file);
      if (tags) {
        if (tags.title) setTrackTitle(tags.title);
        if (tags.artist) setTrackArtist(tags.artist);
        if (tags.picture) {
          try {
            setTrackCover(pictureToDataUrl(tags.picture));
          } catch {
            /* ignore */
          }
        }
      }
    },
    [clearMetadata],
  );

  const loadUrl = useCallback(
    (url: string) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      audio.src = url;
      audio.load();

      let display = url;
      try {
        const parsed = new URL(url, window.location.href);
        const last = parsed.pathname.split('/').filter(Boolean).pop();
        display = last ? decodeURIComponent(last) : parsed.hostname;
      } catch {
        /* leave as-is */
      }
      setFileName(display);
      setIsReady(false);
      setIsPlaying(false);
      setError(null);
      clearMetadata();
    },
    [clearMetadata],
  );

  const dismissError = useCallback(() => setError(null), []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    ensureElementGraph();
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') await ctx.resume();
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  }, [ensureElementGraph]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
  }, []);

  const restart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.currentTime = 0;
  }, []);

  const setVolume = useCallback((v: number) => {
    const next = Math.max(0, Math.min(1, v));
    setVolumeState(next);
    if (next > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const toggleLoop = useCallback(() => {
    setLoop((l) => !l);
  }, []);

  const stopMicTracks = useCallback(() => {
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    micSourceRef.current?.disconnect();
    micSourceRef.current = null;
  }, []);

  const enableMic = useCallback(async () => {
    try {
      const ctx = ensureCtx();
      const analyser = ensureAnalyser();
      if (!ctx || !analyser) return;
      if (ctx.state === 'suspended') await ctx.resume();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // Pause any playback through the audio element and detach its source.
      const audio = audioRef.current;
      if (audio && !audio.paused) audio.pause();
      elementSourceRef.current?.disconnect();

      stopMicTracks();
      micStreamRef.current = stream;
      micSourceRef.current = ctx.createMediaStreamSource(stream);

      analyser.disconnect();
      micSourceRef.current.connect(analyser);
      // Important: do NOT connect mic → ctx.destination (avoids feedback).
      if (recordingDestRef.current) analyser.connect(recordingDestRef.current);

      setInputMode('mic');
      setFileName('Microphone');
      clearMetadata();
      setError(null);
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Microphone permission was denied.'
          : 'Could not access the microphone.';
      setError(msg);
    }
  }, [clearMetadata, ensureAnalyser, ensureCtx, stopMicTracks]);

  const disableMic = useCallback(() => {
    stopMicTracks();
    setInputMode('element');
    setFileName((prev) => (prev === 'Microphone' ? null : prev));
    // Restore the element → analyser → destination chain if we have a source.
    const analyser = analyserRef.current;
    const ctx = audioCtxRef.current;
    if (analyser) {
      analyser.disconnect();
      if (elementSourceRef.current) {
        elementSourceRef.current.connect(analyser);
      }
      if (ctx) analyser.connect(ctx.destination);
      if (recordingDestRef.current) analyser.connect(recordingDestRef.current);
    }
  }, [stopMicTracks]);

  const getRecordingAudioStream = useCallback((): MediaStream | null => {
    const ctx = ensureCtx();
    const analyser = ensureAnalyser();
    if (!ctx || !analyser) return null;
    if (!recordingDestRef.current) {
      recordingDestRef.current = ctx.createMediaStreamDestination();
      analyser.connect(recordingDestRef.current);
    }
    return recordingDestRef.current.stream;
  }, [ensureAnalyser, ensureCtx]);

  // Sync volume / muted / loop to the audio element.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.muted = muted;
  }, [muted]);
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.loop = loop;
  }, [loop]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onLoaded = () => {
      setIsReady(true);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const onError = () => {
      const err = audio.error;
      if (!err) {
        setError('Failed to load audio.');
        return;
      }
      switch (err.code) {
        case err.MEDIA_ERR_ABORTED:
          return;
        case err.MEDIA_ERR_NETWORK:
          setError('Network error while loading audio.');
          break;
        case err.MEDIA_ERR_DECODE:
          setError('Audio is corrupt or in an unsupported format.');
          break;
        case err.MEDIA_ERR_SRC_NOT_SUPPORTED:
          setError(
            'Could not load this URL — the server may block CORS, or the format is unsupported.',
          );
          break;
        default:
          setError('Failed to load audio.');
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      analyserRef.current?.disconnect();
      elementSourceRef.current?.disconnect();
      micSourceRef.current?.disconnect();
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  return {
    audioRef,
    analysisRef,
    fileName,
    isPlaying,
    isReady,
    duration,
    volume,
    muted,
    loop,
    error,
    inputMode,
    trackTitle,
    trackArtist,
    trackCover,
    loadFile,
    loadUrl,
    togglePlay,
    seek,
    restart,
    setVolume,
    toggleMute,
    toggleLoop,
    dismissError,
    enableMic,
    disableMic,
    getRecordingAudioStream,
    sampleAnalysis,
  };
}
