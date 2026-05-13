import { audioBufferToWavBlob } from '@/lib/audioFormat';

/**
 * Generate a short royalty-free demo track entirely in the browser using
 * OfflineAudioContext, then encode it as a WAV File ready to feed to the
 * existing loadFile() pipeline. Kick + hi-hat + bass arp, 4 bars at 120 BPM.
 */
export async function generateSampleTrack(): Promise<File> {
  const sampleRate = 44100;
  const bpm = 120;
  const beatSec = 60 / bpm;
  const bars = 4;
  const durationSec = bars * 4 * beatSec + 0.5;

  const ctx = new OfflineAudioContext(
    2,
    Math.ceil(sampleRate * durationSec),
    sampleRate,
  );

  // Master with a soft limiter compressor so peaks don't clip.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 12;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.12;
  limiter.connect(ctx.destination);

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.9;
  masterGain.connect(limiter);

  const noteHz = (semitone: number) => 440 * Math.pow(2, (semitone - 69) / 12);

  // Reusable noise buffer for hi-hat.
  const hatBuf = ctx.createBuffer(1, sampleRate * 0.08, sampleRate);
  {
    const data = hatBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  for (let bar = 0; bar < bars; bar++) {
    const barT = bar * 4 * beatSec;

    // Four-on-the-floor kick.
    for (let b = 0; b < 4; b++) {
      const t = barT + b * beatSec;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      g.gain.setValueAtTime(1.0, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(g).connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.35);
    }

    // Hi-hat on 8th-note offbeats.
    for (let i = 0; i < 8; i++) {
      if (i % 2 === 0) continue;
      const t = barT + i * (beatSec / 2);
      const src = ctx.createBufferSource();
      src.buffer = hatBuf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 7000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      src.connect(hp).connect(g).connect(masterGain);
      src.start(t);
    }

    // Bass arpeggio (A minor pentatonic).
    const notes = [33, 36, 40, 43]; // A1, C2, E2, G2 in MIDI
    for (let n = 0; n < 4; n++) {
      const t = barT + n * beatSec;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = noteHz(notes[(bar + n) % notes.length]);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(800, t);
      lp.frequency.exponentialRampToValueAtTime(200, t + 0.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.32, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + beatSec * 0.9);
      osc.connect(lp).connect(g).connect(masterGain);
      osc.start(t);
      osc.stop(t + beatSec);
    }

    // Lead pad (every 2 beats).
    for (let n = 0; n < 2; n++) {
      const t = barT + n * 2 * beatSec;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = noteHz(57 + (bar % 2 === 0 ? 0 : 3)); // A3 / C4
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.15);
      g.gain.linearRampToValueAtTime(0.0, t + 2 * beatSec);
      osc.connect(g).connect(masterGain);
      osc.start(t);
      osc.stop(t + 2 * beatSec);
    }
  }

  const rendered = await ctx.startRendering();
  const blob = audioBufferToWavBlob(rendered);
  return new File([blob], 'demo-beat.wav', { type: 'audio/wav' });
}
