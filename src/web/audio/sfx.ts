"use client";
/**
 * Web Audio engine. Synthesises the shared recipes (src/audio/sounds.ts) on demand —
 * no audio files are downloaded for site interactions. Unlocks on the first user gesture,
 * remembers the ON/OFF choice, and exposes a live "charge" voice for HOLD TO CHARGE.
 */
import { MASTER, type Cue } from "@/audio/cues";
import { SR } from "@/audio/synth";
import { render, type SoundId } from "@/audio/sounds";

type PlayOptions = { volume?: number; rate?: number; delay?: number; pan?: number };
const STORAGE_KEY = "ive-sfx";

class SfxEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private buffers = new Map<SoundId, AudioBuffer>();
  private listeners = new Set<() => void>();
  enabled = true;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.enabled = window.localStorage.getItem(STORAGE_KEY) !== "off";
      } catch {
        /* storage unavailable — keep default */
      }
    }
  }

  /** Audio is only audible after a user gesture (browser autoplay policy). */
  get ready() {
    return !!this.ctx && this.ctx.state === "running";
  }

  /** Call from a user-gesture handler. Safe to call repeatedly. */
  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -10;
      comp.ratio.value = 4;
      this.out = this.ctx.createGain();
      this.out.gain.value = this.enabled ? MASTER : 0;
      this.out.connect(comp).connect(this.ctx.destination);
    }
    if (this.ctx.state !== "running") void this.ctx.resume().then(() => this.emit());
    this.emit();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    try {
      window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    } catch {
      /* ignore */
    }
    if (this.out && this.ctx) this.out.gain.setTargetAtTime(on ? MASTER : 0, this.ctx.currentTime, 0.02);
    if (on) this.unlock();
    this.emit();
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  private buffer(id: SoundId) {
    let b = this.buffers.get(id);
    if (!b && this.ctx) {
      const data = render(id);
      b = this.ctx.createBuffer(1, data.length, SR);
      b.getChannelData(0).set(data);
      this.buffers.set(id, b);
    }
    return b;
  }

  /** Pre-synthesise sounds during idle time so the first play is instant. */
  warm(ids: SoundId[]) {
    if (!this.ctx) return;
    const queue = [...ids];
    const step = () => {
      const id = queue.shift();
      if (!id) return;
      this.buffer(id);
      if ("requestIdleCallback" in window) window.requestIdleCallback(step);
      else setTimeout(step, 16);
    };
    step();
  }

  play(id: SoundId, { volume = 1, rate = 1, delay = 0, pan = 0 }: PlayOptions = {}) {
    if (process.env.NODE_ENV !== "production") {
      // Dev-only trace so QA scripts can assert what played (window.__sfx).
      const w = window as unknown as { __sfx?: string[] };
      (w.__sfx ??= []).push(`${id}${this.ready && this.enabled ? "" : "(silent)"}`);
    }
    if (!this.enabled || !this.ready || !this.ctx || !this.out) return;
    const buf = this.buffer(id);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = volume;
    let node: AudioNode = src.connect(g);
    if (pan && this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = pan;
      node = node.connect(p);
    }
    node.connect(this.out);
    src.start(this.ctx.currentTime + delay);
  }

  /** Fire every cue whose frame was crossed between `from` (exclusive) and `to` (inclusive). */
  cues(sheet: Cue[], from: number, to: number) {
    for (const c of sheet) if (c.at > from && c.at <= to) this.play(c.sound, { volume: c.volume, rate: c.rate });
  }

  /** A live, continuously controllable charge-up voice. */
  chargeVoice() {
    if (!this.enabled || !this.ready || !this.ctx || !this.out) return null;
    const ctx = this.ctx;
    const saw = ctx.createOscillator();
    const sq = ctx.createOscillator();
    saw.type = "sawtooth";
    sq.type = "square";
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 6;
    const g = ctx.createGain();
    g.gain.value = 0;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 7;
    lfoGain.gain.value = 0;
    lfo.connect(lfoGain).connect(saw.frequency);
    saw.connect(lp);
    sq.connect(lp);
    lp.connect(g).connect(this.out);
    [saw, sq, lfo].forEach((o) => o.start());
    const set = (p: number) => {
      const t = ctx.currentTime;
      saw.frequency.setTargetAtTime(110 * 2 ** (p * 3), t, 0.03);
      sq.frequency.setTargetAtTime(165 * 2 ** (p * 3), t, 0.03);
      lp.frequency.setTargetAtTime(300 + p * p * 6000, t, 0.03);
      lfoGain.gain.setTargetAtTime(4 + p * 40, t, 0.05);
      lfo.frequency.setTargetAtTime(6 + p * 18, t, 0.05);
      g.gain.setTargetAtTime(0.05 + p * 0.22, t, 0.03);
    };
    set(0);
    let stopped = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      const t = ctx.currentTime;
      saw.frequency.setTargetAtTime(60, t, 0.08);
      g.gain.setTargetAtTime(0, t, 0.06);
      [saw, sq, lfo].forEach((o) => o.stop(t + 0.4));
    };
    return { set, stop };
  }
}

export const sfx = new SfxEngine();
