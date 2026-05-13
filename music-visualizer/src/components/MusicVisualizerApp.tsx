import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  CircleDot,
  Cone,
  Disc3,
  Hexagon,
  Keyboard,
  Link2,
  Loader2,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Music,
  Palette,
  Pause,
  Pill,
  Play,
  Repeat,
  RotateCcw,
  Settings,
  Sparkles,
  Spline,
  Square,
  Triangle,
  Upload,
  Volume2,
  VolumeX,
  X,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/Button';
import { CanvasFallback } from '@/components/CanvasFallback';
import { Slider } from '@/components/Slider';
import { useAudio } from '@/contexts/AudioContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useRecorder } from '@/hooks/useRecorder';
import { useTheme } from '@/hooks/useTheme';
import { generateSampleTrack } from '@/lib/sampleTrack';
import { cn } from '@/lib/cn';
import type {
  CustomColors,
  ModelKind,
} from '@/components/MusicVisualizerScene';

const MusicVisualizerScene = lazy(
  () => import('@/components/MusicVisualizerScene'),
);

const URL_INPUT_CLASSES =
  'min-w-0 flex-1 rounded-md border border-zinc-900/10 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40';

const MODELS: { key: ModelKind; label: string; icon: LucideIcon }[] = [
  { key: 'icosahedron', label: 'Icosahedron', icon: Hexagon },
  { key: 'tetrahedron', label: 'Tetrahedron', icon: Triangle },
  { key: 'torus', label: 'Torus', icon: CircleDot },
  { key: 'cone', label: 'Cone', icon: Cone },
  { key: 'capsule', label: 'Capsule', icon: Pill },
  { key: 'torusKnot', label: 'Torus Knot', icon: Spline },
];

const MODEL_STORAGE_KEY = 'mv-model';
const PALETTE_STORAGE_KEY = 'mv-custom-palette';

const DEFAULT_CUSTOM: CustomColors = {
  colorLow: '#1e1b4b',
  colorMid: '#a78bfa',
  colorHigh: '#22d3ee',
};

function readStoredModel(): ModelKind {
  try {
    const stored = localStorage.getItem(MODEL_STORAGE_KEY);
    if (stored && MODELS.some((m) => m.key === stored)) {
      return stored as ModelKind;
    }
  } catch {
    /* ignore */
  }
  return 'icosahedron';
}

function readStoredCustom(): {
  enabled: boolean;
  colors: CustomColors;
} {
  try {
    const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as {
        enabled?: boolean;
        colors?: CustomColors;
      };
      if (parsed.colors) {
        return {
          enabled: !!parsed.enabled,
          colors: { ...DEFAULT_CUSTOM, ...parsed.colors },
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { enabled: false, colors: DEFAULT_CUSTOM };
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const SHORTCUTS: { combo: string; description: string }[] = [
  { combo: 'Space', description: 'Play / pause' },
  { combo: '← / →', description: 'Seek -5s / +5s' },
  { combo: '↑ / ↓', description: 'Volume up / down' },
  { combo: 'M', description: 'Mute' },
  { combo: 'L', description: 'Toggle loop' },
  { combo: 'F', description: 'Fullscreen' },
  { combo: 'R', description: 'Restart track' },
];

export function MusicVisualizerApp() {
  const {
    audioRef,
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
  } = useAudio();

  const { theme } = useTheme();
  const recorder = useRecorder();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const [progress, setProgress] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [emptyUrl, setEmptyUrl] = useState('');
  const [transportUrl, setTransportUrl] = useState('');
  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [model, setModelState] = useState<ModelKind>(readStoredModel);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const [customPalette, setCustomPalette] = useState(() => readStoredCustom());

  const setModel = useCallback((next: ModelKind) => {
    setModelState(next);
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const persistCustom = useCallback(
    (next: { enabled: boolean; colors: CustomColors }) => {
      setCustomPalette(next);
      try {
        localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const effectiveCustomColors = customPalette.enabled
    ? customPalette.colors
    : null;

  const isMic = inputMode === 'mic';

  // Drive progress from RAF while playing.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let raf = 0;
    const tick = () => {
      if (!scrubbing && audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    if (isPlaying && !isMic) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audioRef, isPlaying, scrubbing, isMic]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.duration > 0) {
      setProgress(audio.currentTime / audio.duration);
    }
  }, [audioRef]);

  useEffect(() => {
    if (linkPanelOpen) urlInputRef.current?.focus();
  }, [linkPanelOpen]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handlePick = () => inputRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  const handleSeekChange = (ratio: number) => {
    if (isMic || !isReady || !duration) return;
    setProgress(ratio);
    seek(ratio * duration);
  };

  const submitEmptyUrl = (e: FormEvent) => {
    e.preventDefault();
    const url = emptyUrl.trim();
    if (!url) return;
    loadUrl(url);
    setEmptyUrl('');
  };

  const submitTransportUrl = (e: FormEvent) => {
    e.preventDefault();
    const url = transportUrl.trim();
    if (!url) return;
    loadUrl(url);
    setTransportUrl('');
    setLinkPanelOpen(false);
  };

  const cancelLinkPanel = () => {
    setLinkPanelOpen(false);
    setTransportUrl('');
  };

  const loadDemo = useCallback(async () => {
    setDemoLoading(true);
    try {
      const file = await generateSampleTrack();
      await loadFile(file);
    } catch {
      /* swallow — error surface already handled by audio element */
    } finally {
      setDemoLoading(false);
    }
  }, [loadFile]);

  const toggleMic = useCallback(async () => {
    if (isMic) {
      disableMic();
    } else {
      await enableMic();
    }
  }, [disableMic, enableMic, isMic]);

  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (recorder.isRecording) {
      recorder.stop();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const audioStream = getRecordingAudioStream();
    recorder.start(canvas, audioStream);
  }, [getRecordingAudioStream, recorder]);

  // Keyboard shortcuts. Built each render but the hook stores them in a ref
  // so the listener doesn't re-attach.
  useKeyboardShortcuts(
    useMemo(
      () => ({
        space: () => {
          if (!isMic) togglePlay();
        },
        arrowright: () => {
          if (!isMic && duration) seek(Math.min(duration, (audioRef.current?.currentTime ?? 0) + 5));
        },
        arrowleft: () => {
          if (!isMic && duration) seek(Math.max(0, (audioRef.current?.currentTime ?? 0) - 5));
        },
        arrowup: () => setVolume(Math.min(1, volume + 0.05)),
        arrowdown: () => setVolume(Math.max(0, volume - 0.05)),
        m: toggleMute,
        l: () => {
          if (!isMic) toggleLoop();
        },
        f: toggleFullscreen,
        r: () => {
          if (!isMic) restart();
        },
      }),
      [
        audioRef,
        duration,
        isMic,
        restart,
        seek,
        setVolume,
        toggleFullscreen,
        toggleLoop,
        toggleMute,
        togglePlay,
        volume,
      ],
    ),
  );

  // Drag-and-drop on the canvas wrapper.
  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDraggingFile(true);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) setIsDraggingFile(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      loadFile(file);
    }
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : Volume2;
  const MicIcon = isMic ? MicOff : Mic;
  const FullscreenIcon = isFullscreen ? Minimize2 : Maximize2;
  const displayTitle = trackTitle ?? fileName;
  const displaySubtitle = trackArtist;

  return (
    <div
      ref={wrapperRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-[#05030d] dark:shadow-black/40',
        isFullscreen ? 'h-screen rounded-none' : 'h-[78vh] min-h-[520px]',
      )}
    >
      <div className="absolute inset-0">
        <Suspense fallback={<CanvasFallback label="Compiling visualizer…" />}>
          <MusicVisualizerScene
            sampleAnalysis={sampleAnalysis}
            theme={theme}
            model={model}
            customColors={effectiveCustomColors}
            onCanvasReady={(c) => {
              canvasRef.current = c;
            }}
          />
        </Suspense>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleFile}
        className="hidden"
      />

      {/* Drag-and-drop indicator */}
      {isDraggingFile && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-violet-500/15 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-violet-400 bg-white/80 px-6 py-5 text-sm font-medium text-violet-700 dark:bg-black/60 dark:text-violet-200">
            Drop audio file to play
          </div>
        </div>
      )}

      {/* Empty-state CTA */}
      {!fileName && !isMic && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
          <div className="pointer-events-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-black/10 bg-white/75 px-6 py-7 text-center shadow-lg shadow-black/5 backdrop-blur-md dark:border-white/10 dark:bg-black/40 dark:shadow-none">
            <div className="rounded-full border border-black/10 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5">
              <Music className="size-6 text-violet-500 dark:text-violet-300" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-zinc-900 dark:text-white">
                Choose a track to begin
              </p>
              <p className="max-w-xs text-xs text-zinc-600 dark:text-white/60">
                Drop a file here, pick one, use your mic, paste a URL, or try the
                in-browser demo.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
              <Button onClick={handlePick} size="sm">
                <Upload /> File
              </Button>
              <Button
                onClick={toggleMic}
                size="sm"
                variant="secondary"
                aria-label="Use microphone"
              >
                <Mic /> Microphone
              </Button>
              <Button
                onClick={loadDemo}
                size="sm"
                variant="secondary"
                disabled={demoLoading}
                title="Generate a short demo track"
              >
                {demoLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                {demoLoading ? 'Building…' : 'Demo'}
              </Button>
            </div>
            <div className="flex w-full items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-white/40">
              <span className="h-px flex-1 bg-zinc-900/10 dark:bg-white/10" />
              or paste a URL
              <span className="h-px flex-1 bg-zinc-900/10 dark:bg-white/10" />
            </div>
            <form onSubmit={submitEmptyUrl} className="flex w-full gap-2">
              <input
                type="url"
                value={emptyUrl}
                onChange={(e) => setEmptyUrl(e.target.value)}
                placeholder="https://example.com/song.mp3"
                aria-label="Audio URL"
                className={URL_INPUT_CLASSES}
              />
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                disabled={!emptyUrl.trim()}
              >
                Load
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Track-name pill (top-left) */}
      {fileName && (
        <div className="pointer-events-none absolute left-4 top-4 z-10 flex max-w-[60%] items-center gap-2 rounded-full border border-black/10 bg-white/70 py-1 pl-1 pr-3 backdrop-blur-md dark:border-white/10 dark:bg-black/40">
          {trackCover ? (
            <img
              src={trackCover}
              alt=""
              className="size-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
              {isMic ? (
                <Mic className="size-3.5 text-violet-500 dark:text-violet-300" />
              ) : (
                <Music className="size-3.5 text-violet-500 dark:text-violet-300" />
              )}
            </span>
          )}
          <span className="min-w-0 flex flex-col text-xs leading-tight">
            <span className="truncate font-medium text-zinc-800 dark:text-white/90">
              {displayTitle}
            </span>
            {displaySubtitle && (
              <span className="truncate text-[10px] text-zinc-500 dark:text-white/50">
                {displaySubtitle}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Recording indicator (top-right) */}
      {recorder.isRecording && (
        <div className="pointer-events-none absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-700 backdrop-blur-md dark:text-red-200">
          <span className="size-2 animate-pulse rounded-full bg-red-500" />
          REC {formatTime(recorder.elapsedMs / 1000)}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="absolute inset-x-4 top-16 z-10 flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700 backdrop-blur-md dark:text-red-200">
          <span className="flex-1 leading-relaxed">{error}</span>
          <button
            type="button"
            onClick={dismissError}
            aria-label="Dismiss error"
            className="-mr-1 grid size-5 place-items-center rounded text-red-700/70 transition-colors hover:bg-red-500/20 hover:text-red-700 dark:text-red-200/70 dark:hover:text-red-200"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Transport */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 border-t border-black/10 bg-gradient-to-t from-white/85 via-white/55 to-transparent px-4 pb-4 pt-5 backdrop-blur-sm transition-opacity duration-300',
          'dark:border-white/10 dark:from-black/85 dark:via-black/55 dark:to-transparent',
          fileName || isMic ? 'opacity-100' : 'opacity-0',
        )}
      >
        {/* Shortcuts panel */}
        {shortcutsOpen && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-md border border-black/10 bg-white/60 px-3 py-2 text-xs animate-fade-in sm:grid-cols-3 dark:border-white/10 dark:bg-black/40">
            {SHORTCUTS.map((s) => (
              <div
                key={s.combo}
                className="flex items-center gap-2 text-zinc-700 dark:text-white/70"
              >
                <kbd className="rounded border border-black/10 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-800 dark:border-white/10 dark:bg-white/10 dark:text-white/90">
                  {s.combo}
                </kbd>
                <span>{s.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Settings: geometry + custom palette */}
        {settingsOpen && (
          <div className="flex flex-col gap-2 animate-fade-in">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-white/60">
                Geometry
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MODELS.map((m) => {
                  const active = model === m.key;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setModel(m.key)}
                      aria-pressed={active}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60',
                        active
                          ? 'border-violet-400 bg-violet-500/15 text-violet-700 dark:border-violet-400/60 dark:bg-violet-500/20 dark:text-violet-100'
                          : 'border-zinc-900/10 text-zinc-700 hover:bg-zinc-900/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5',
                      )}
                    >
                      <Icon className="size-3.5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-white/60">
                Custom palette
              </span>
              <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-white/70">
                <input
                  type="checkbox"
                  checked={customPalette.enabled}
                  onChange={(e) =>
                    persistCustom({
                      ...customPalette,
                      enabled: e.target.checked,
                    })
                  }
                  className="size-3.5 accent-violet-500"
                />
                <Palette className="size-3.5" /> Override colors
              </label>
              {(['colorLow', 'colorMid', 'colorHigh'] as const).map((k) => (
                <label
                  key={k}
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] text-zinc-700 transition-opacity dark:text-white/70',
                    !customPalette.enabled && 'opacity-50',
                  )}
                >
                  <input
                    type="color"
                    value={customPalette.colors[k]}
                    disabled={!customPalette.enabled}
                    onChange={(e) =>
                      persistCustom({
                        ...customPalette,
                        colors: {
                          ...customPalette.colors,
                          [k]: e.target.value,
                        },
                      })
                    }
                    className="size-6 cursor-pointer rounded border border-black/10 bg-transparent disabled:cursor-not-allowed dark:border-white/10"
                  />
                  {k === 'colorLow' ? 'Low' : k === 'colorMid' ? 'Mid' : 'High'}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* URL input panel */}
        {linkPanelOpen && (
          <form
            onSubmit={submitTransportUrl}
            className="flex items-center gap-2 animate-fade-in"
          >
            <Link2 className="size-4 shrink-0 text-zinc-500 dark:text-white/60" />
            <input
              ref={urlInputRef}
              type="url"
              value={transportUrl}
              onChange={(e) => setTransportUrl(e.target.value)}
              placeholder="https://example.com/song.mp3"
              aria-label="Audio URL"
              className={URL_INPUT_CLASSES}
            />
            <Button type="submit" size="sm" disabled={!transportUrl.trim()}>
              Load
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={cancelLinkPanel}
            >
              Cancel
            </Button>
          </form>
        )}

        {/* Seek bar (or live mic state) */}
        <div className="flex items-center gap-3">
          {isMic ? (
            <div className="flex flex-1 items-center justify-center gap-2 py-1 text-[11px] uppercase tracking-[0.2em] text-violet-700 dark:text-violet-200">
              <Disc3 className="size-3.5 animate-spin [animation-duration:6s]" />
              Live microphone
            </div>
          ) : (
            <>
              <span className="font-mono text-[11px] tabular-nums tracking-wider text-zinc-700 min-w-[3ch] text-right dark:text-white/60">
                {formatTime(progress * duration)}
              </span>
              <Slider
                value={progress}
                onChange={handleSeekChange}
                onScrubStart={() => setScrubbing(true)}
                onScrubEnd={() => setScrubbing(false)}
                ariaLabel="Seek"
                disabled={!isReady}
                className="flex-1"
              />
              <span className="font-mono text-[11px] tabular-nums tracking-wider text-zinc-500 min-w-[3ch] dark:text-white/40">
                {formatTime(duration)}
              </span>
            </>
          )}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={restart}
              disabled={isMic || !isReady}
              aria-label="Restart"
              title="Restart (R)"
            >
              <RotateCcw />
            </Button>
            <Button
              size="icon"
              variant="primary"
              onClick={togglePlay}
              disabled={isMic || !isReady}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <Button
              size="icon"
              variant={loop ? 'primary' : 'secondary'}
              onClick={toggleLoop}
              disabled={isMic}
              aria-label={loop ? 'Disable loop' : 'Enable loop'}
              aria-pressed={loop}
              title="Loop (L)"
            >
              <Repeat />
            </Button>
            <Button
              size="icon"
              variant={isMic ? 'primary' : 'secondary'}
              onClick={toggleMic}
              aria-pressed={isMic}
              aria-label={isMic ? 'Stop microphone' : 'Use microphone'}
              title={isMic ? 'Stop microphone' : 'Use microphone'}
            >
              <MicIcon />
            </Button>
          </div>

          <div className="flex min-w-[140px] flex-1 items-center gap-2 sm:flex-none sm:basis-44">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              title="Mute (M)"
              className="grid size-8 place-items-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-900/5 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <VolumeIcon className="size-4" />
            </button>
            <Slider
              value={muted ? 0 : volume}
              onChange={setVolume}
              ariaLabel="Volume"
              fillClassName="bg-zinc-700/80 dark:bg-white/80"
              thumbClassName="bg-zinc-900 ring-1 ring-zinc-900/30 dark:bg-white dark:ring-white/40"
              className="flex-1"
            />
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={recorder.isRecording ? 'primary' : 'ghost'}
              onClick={toggleRecording}
              disabled={!recorder.supported}
              aria-pressed={recorder.isRecording}
              title={
                recorder.supported
                  ? recorder.isRecording
                    ? 'Stop recording'
                    : 'Record visualizer'
                  : 'Recording not supported in this browser'
              }
            >
              {recorder.isRecording ? <Square /> : <Disc3 />}
              {recorder.isRecording ? 'Stop' : 'Record'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              aria-pressed={isFullscreen}
              title="Fullscreen (F)"
            >
              <FullscreenIcon />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShortcutsOpen((o) => !o)}
              aria-pressed={shortcutsOpen}
              title="Keyboard shortcuts"
            >
              <Keyboard />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSettingsOpen((o) => !o)}
              aria-pressed={settingsOpen}
              title="Visualizer settings"
            >
              <Settings /> Settings
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLinkPanelOpen((o) => !o)}
              aria-pressed={linkPanelOpen}
              title="Load from URL"
            >
              <Link2 /> URL
            </Button>
            <Button size="sm" variant="ghost" onClick={handlePick}>
              <Upload /> Change
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
