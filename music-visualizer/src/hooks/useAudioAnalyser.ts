import { useCallback, useEffect, useRef, useState } from 'react';

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
  loadFile: (file: File) => void;
  loadUrl: (url: string) => void;
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  restart: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  dismissError: () => void;
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

export function useAudioAnalyser(): UseAudioAnalyser {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
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

  const ensureGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (!sourceRef.current) {
      sourceRef.current = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = SMOOTHING;
      sourceRef.current.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
    }
  }, []);

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
    const exceeds = bass > bassEnergyAvgRef.current * BEAT_THRESHOLD && bass > 0.18;
    const cooled = now - lastBeatRef.current > BEAT_REFRACTORY_MS;
    const beat = exceeds && cooled;
    if (beat) lastBeatRef.current = now;

    const beatStrength = Math.max(
      0,
      Math.min(1, (bass - bassEnergyAvgRef.current) / Math.max(0.05, bassEnergyAvgRef.current)),
    );

    out.bass = bass;
    out.mid = mid;
    out.high = high;
    out.level = level;
    out.beat = beat;
    out.beatStrength = beatStrength;
    return out;
  }, []);

  const loadFile = useCallback((file: File) => {
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
  }, []);

  const loadUrl = useCallback((url: string) => {
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
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    ensureGraph();
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') await ctx.resume();
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  }, [ensureGraph]);

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
      analyserRef.current?.disconnect();
      sourceRef.current?.disconnect();
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
    loadFile,
    loadUrl,
    togglePlay,
    seek,
    restart,
    setVolume,
    toggleMute,
    toggleLoop,
    dismissError,
    sampleAnalysis,
  };
}
