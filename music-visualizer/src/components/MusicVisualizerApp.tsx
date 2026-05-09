import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  CircleDot,
  Cone,
  Hexagon,
  Link2,
  Music,
  Pause,
  Pill,
  Play,
  Repeat,
  RotateCcw,
  Settings,
  Spline,
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
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';
import type { ModelKind } from '@/components/MusicVisualizerScene';

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

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

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
  } = useAudio();

  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [emptyUrl, setEmptyUrl] = useState('');
  const [transportUrl, setTransportUrl] = useState('');
  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [model, setModelState] = useState<ModelKind>(readStoredModel);

  const setModel = useCallback((next: ModelKind) => {
    setModelState(next);
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  // Drive progress from RAF while playing; pause keeps last value.
  // Skip while the user is scrubbing so the indicator follows the cursor.
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
    if (isPlaying) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audioRef, isPlaying, scrubbing]);

  // Sync progress on mount / route return so the bar reflects current time
  // even before playback resumes.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.duration > 0) {
      setProgress(audio.currentTime / audio.duration);
    }
  }, [audioRef]);

  useEffect(() => {
    if (linkPanelOpen) urlInputRef.current?.focus();
  }, [linkPanelOpen]);

  const handlePick = () => inputRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  const handleSeekChange = (ratio: number) => {
    if (!isReady || !duration) return;
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

  const VolumeIcon = muted || volume === 0 ? VolumeX : Volume2;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-black/10 bg-white h-[78vh] min-h-[520px] shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-[#05030d] dark:shadow-black/40">
      <div className="absolute inset-0">
        <Suspense fallback={<CanvasFallback label="Compiling visualizer…" />}>
          <MusicVisualizerScene
            sampleAnalysis={sampleAnalysis}
            theme={theme}
            model={model}
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

      {!fileName && (
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
                Files are decoded locally. URLs need to allow cross-origin
                requests so the analyser can read the waveform.
              </p>
            </div>
            <Button onClick={handlePick} size="sm" className="w-full">
              <Upload /> Choose audio file
            </Button>
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

      {fileName && (
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs text-zinc-700 backdrop-blur-md dark:border-white/10 dark:bg-black/40 dark:text-white/80">
          <Music className="size-3.5 text-violet-500 dark:text-violet-300" />
          <span className="max-w-[40vw] truncate">{fileName}</span>
        </div>
      )}

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

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-black/10 bg-gradient-to-t from-white/85 via-white/55 to-transparent px-4 pb-4 pt-5 backdrop-blur-sm transition-opacity duration-300',
          'dark:border-white/10 dark:from-black/85 dark:via-black/55 dark:to-transparent',
          fileName ? 'opacity-100' : 'opacity-0',
        )}
      >
        {settingsOpen && (
          <div className="flex flex-wrap items-center gap-2 animate-fade-in">
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
        )}

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

        <div className="flex items-center gap-3">
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
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={restart}
              disabled={!isReady}
              aria-label="Restart"
              title="Restart"
            >
              <RotateCcw />
            </Button>
            <Button
              size="icon"
              variant="primary"
              onClick={togglePlay}
              disabled={!isReady}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <Button
              size="icon"
              variant={loop ? 'primary' : 'secondary'}
              onClick={toggleLoop}
              aria-label={loop ? 'Disable loop' : 'Enable loop'}
              aria-pressed={loop}
              title={loop ? 'Loop on' : 'Loop off'}
            >
              <Repeat />
            </Button>
          </div>

          <div className="flex min-w-[140px] flex-1 items-center gap-2 sm:flex-none sm:basis-44">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              title={muted ? 'Unmute' : 'Mute'}
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

          <div className="ml-auto flex items-center gap-2">
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
