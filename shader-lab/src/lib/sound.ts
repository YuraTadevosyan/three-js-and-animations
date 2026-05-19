/**
 * Tiny Web Audio synth — no sample assets, every effect is a scheduled oscillator.
 * Kept as a module-level singleton so all components share one AudioContext and
 * one persisted mute setting.
 *
 * Browsers gate AudioContext on a user gesture; we lazy-create on first call and
 * resume() on every play in case the context was suspended.
 */

const STORAGE_KEY = 'shader-lab:sound-enabled';

type PlayOptions = {
  freq: number;
  freq2?: number;
  dur: number;
  gain: number;
  type?: OscillatorType;
  delay?: number;
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastHoverAt = 0;
  enabled: boolean;

  constructor() {
    let stored: string | null = null;
    try {
      stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    } catch {
      // Private mode / disabled storage — fall through to default.
    }
    this.enabled = stored == null ? true : stored === '1';
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (v) {
      // Tiny confirmation blip so the user knows audio is on.
      this.click();
    }
  }

  private ensureCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  private play({ freq, freq2, dur, gain, type = 'sine', delay = 0 }: PlayOptions) {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return;
    if (ctx.state === 'suspended') {
      // Fire-and-forget; if the user hasn't interacted yet this no-ops silently.
      void ctx.resume();
    }

    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freq2 !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq2), t + dur);
    }

    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(gain, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(env).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  hover() {
    // Throttle so dragging the cursor over a list doesn't fire a barrage.
    const now = performance.now();
    if (now - this.lastHoverAt < 55) return;
    this.lastHoverAt = now;
    this.play({ freq: 1800, dur: 0.045, gain: 0.035, type: 'sine' });
  }

  click() {
    this.play({ freq: 880, freq2: 620, dur: 0.09, gain: 0.10, type: 'triangle' });
  }

  toggleOn() {
    this.play({ freq: 520, freq2: 980, dur: 0.11, gain: 0.09, type: 'triangle' });
  }

  toggleOff() {
    this.play({ freq: 980, freq2: 520, dur: 0.11, gain: 0.09, type: 'triangle' });
  }

  open() {
    this.play({ freq: 520, dur: 0.08, gain: 0.08, type: 'sine' });
    this.play({ freq: 780, dur: 0.10, gain: 0.07, type: 'sine', delay: 0.06 });
  }

  close() {
    this.play({ freq: 780, dur: 0.07, gain: 0.07, type: 'sine' });
    this.play({ freq: 460, dur: 0.10, gain: 0.07, type: 'sine', delay: 0.05 });
  }
}

export const sound = new SoundEngine();
