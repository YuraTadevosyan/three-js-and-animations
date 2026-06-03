import { useEffect, useRef, useState } from 'react';

// Toggle button that plays a looping audio bed while the user reads.
//
// Source priority:
//   1. If `public/audio/anthem.mp3` is reachable, that's the bed — drop a
//      real Cant del Barça mp3 there to use it. Not bundled because the
//      anthem's recording is copyrighted to FCB.
//   2. Otherwise, synthesise a stadium-roar ambience with the Web Audio
//      API (brown noise + lowpass + a slow LFO swell). Zero file, zero
//      licensing question, plays out of the box.
//
// The Web Audio context must be created from a user gesture — modern
// browsers will suspend it otherwise. So the AudioContext / audio element
// are only instantiated on first click.
type Mode = 'idle' | 'file' | 'synth';

const ANTHEM_URL = `${import.meta.env.BASE_URL}audio/anthem.mp3`;

export function AudioToggle() {
  const [on, setOn] = useState(false);
  const [mode, setMode] = useState<Mode>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Probe once on mount whether a real file is reachable. Cheap HEAD
  // request — if it returns OK we'll prefer the file over synthesis when
  // the user toggles on. Done up-front rather than on first click so the
  // click-to-play latency stays low.
  useEffect(() => {
    let cancelled = false;
    fetch(ANTHEM_URL, { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return;
        const contentType = res.headers.get('content-type') ?? '';
        // Some static hosts (GitHub Pages) return 200 + text/html for
        // missing files — accept only audio/* responses as a real file.
        if (res.ok && contentType.startsWith('audio')) {
          setMode('file');
        } else {
          setMode('synth');
        }
      })
      .catch(() => {
        if (!cancelled) setMode('synth');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Tear down both audio paths on unmount.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const startFile = () => {
    if (!audioRef.current) {
      const el = new Audio(ANTHEM_URL);
      el.loop = true;
      el.volume = 0;
      audioRef.current = el;
    }
    const el = audioRef.current;
    el.play().catch(() => {});
    // Fade up to comfortable background level.
    fadeVolume(el, 0.4, 800);
  };

  const stopFile = () => {
    const el = audioRef.current;
    if (!el) return;
    fadeVolume(el, 0, 500, () => el.pause());
  };

  const startSynth = () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(ctx.destination);

      // Brown-noise generator. A long buffer pre-filled with a random
      // walk gives us a deeper rumble than white noise — closer to the
      // low rumble of a packed bowl.
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Body of the crowd — broad lowpass with a slight resonance for
      // some "room" feel.
      const body = ctx.createBiquadFilter();
      body.type = 'lowpass';
      body.frequency.value = 900;
      body.Q.value = 0.7;

      // A tiny bit of higher-frequency hiss so it doesn't sound like
      // pure rumble. Bandpassed and very quiet.
      const hiss = ctx.createBiquadFilter();
      hiss.type = 'bandpass';
      hiss.frequency.value = 3500;
      hiss.Q.value = 0.8;
      const hissGain = ctx.createGain();
      hissGain.gain.value = 0.08;

      // LFO drives the master amplitude so the crowd "breathes" rather
      // than sitting at a flat level — adds life without dipping to
      // silence.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15; // ~6.6s cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.15;
      const swell = ctx.createGain();
      swell.gain.value = 0.85;

      // Wire: noise → body → swell → masterGain
      //       noise → hiss → hissGain → swell
      //       lfo  → lfoGain → swell.gain (additive AM)
      noise.connect(body);
      body.connect(swell);
      noise.connect(hiss);
      hiss.connect(hissGain);
      hissGain.connect(swell);
      lfo.connect(lfoGain);
      lfoGain.connect(swell.gain);
      swell.connect(masterGain);

      noise.start();
      lfo.start();

      ctxRef.current = ctx;
      masterGainRef.current = masterGain;
    }

    const ctx = ctxRef.current;
    const gain = masterGainRef.current;
    if (!ctx || !gain) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    // Fade in over ~1s so the toggle doesn't slam in.
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 1.0);
  };

  const stopSynth = () => {
    const ctx = ctxRef.current;
    const gain = masterGainRef.current;
    if (!ctx || !gain) return;
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.6);
  };

  const handleToggle = () => {
    const next = !on;
    setOn(next);
    // If we haven't probed yet, default to synth.
    const effective: Exclude<Mode, 'idle'> = mode === 'idle' ? 'synth' : mode;
    if (next) {
      effective === 'file' ? startFile() : startSynth();
    } else {
      effective === 'file' ? stopFile() : stopSynth();
    }
  };

  const label = mode === 'file' ? 'Anthem' : 'Ambience';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={on}
      aria-label={on ? `Stop ${label.toLowerCase()}` : `Play ${label.toLowerCase()}`}
      className="audio-toggle"
      data-on={on}
    >
      <span className="audio-toggle__icon" aria-hidden="true">
        {on ? <Wave /> : <NoteIcon />}
      </span>
      <span>{label}</span>
    </button>
  );
}

function NoteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function Wave() {
  // Three bars that pulse via CSS so the on-state visibly does something.
  return (
    <span className="audio-wave" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

// Tiny tween util for HTMLAudioElement volume — avoids depending on GSAP
// for one fade.
function fadeVolume(el: HTMLAudioElement, to: number, ms: number, onDone?: () => void) {
  const from = el.volume;
  const start = performance.now();
  const step = (t: number) => {
    const p = Math.min(1, (t - start) / ms);
    el.volume = from + (to - from) * p;
    if (p < 1) requestAnimationFrame(step);
    else onDone?.();
  };
  requestAnimationFrame(step);
}
