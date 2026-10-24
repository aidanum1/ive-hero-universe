/**
 * Tiny deterministic offline synth. Every IVE HERO UNIVERSE sound effect is generated from
 * code — original, licence-free, a few KB of logic instead of audio files. The same recipes
 * play live in the browser (Web Audio) and are pre-rendered to WAV for Remotion.
 *
 * Self-contained on purpose (no imports) so Node scripts can bundle it directly.
 */

export const SR = 44100;
export type Buf = Float32Array;
type Curve = number | ((t: number) => number);

const val = (c: Curve, t: number) => (typeof c === "number" ? c : c(t));
export const samples = (sec: number) => Math.max(1, Math.round(sec * SR));
export const silence = (sec: number): Buf => new Float32Array(samples(sec));

// ───────────────────────────── sources ─────────────────────────────

export type Wave = "sine" | "square" | "saw" | "tri";

/** Oscillator with an optional frequency curve f(t) in Hz (t in seconds). */
export function osc(sec: number, freq: Curve, wave: Wave = "sine", phase0 = 0): Buf {
  const out = silence(sec);
  let ph = phase0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += val(freq, t) / SR;
    const p = ph - Math.floor(ph);
    switch (wave) {
      case "sine":
        out[i] = Math.sin(p * Math.PI * 2);
        break;
      case "square":
        out[i] = p < 0.5 ? 0.8 : -0.8;
        break;
      case "saw":
        out[i] = (p * 2 - 1) * 0.8;
        break;
      case "tri":
        out[i] = 1 - 4 * Math.abs(p - 0.5);
        break;
    }
  }
  return out;
}

/** FM bell/metal: carrier modulated by ratio·carrier with a decaying index. */
export function fm(sec: number, carrier: Curve, ratio: number, index: Curve): Buf {
  const out = silence(sec);
  let pc = 0;
  let pm = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const fc = val(carrier, t);
    pm += (fc * ratio) / SR;
    pc += fc / SR;
    out[i] = Math.sin(2 * Math.PI * pc + val(index, t) * Math.sin(2 * Math.PI * pm));
  }
  return out;
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded white noise. */
export function noise(sec: number, seed = 1): Buf {
  const r = mulberry(seed * 9973 + 17);
  const out = silence(sec);
  for (let i = 0; i < out.length; i++) out[i] = r() * 2 - 1;
  return out;
}

/** Sparse crackle (electric arcs, static). */
export function crackle(sec: number, density = 0.02, seed = 3): Buf {
  const r = mulberry(seed * 31 + 5);
  const out = silence(sec);
  let hold = 0;
  let v = 0;
  for (let i = 0; i < out.length; i++) {
    if (hold <= 0 && r() < density) {
      hold = 20 + Math.floor(r() * 220);
      v = (r() * 2 - 1) * (0.5 + r() * 0.5);
    }
    out[i] = hold-- > 0 ? v * (r() * 0.6 + 0.4) : 0;
  }
  return out;
}

// ───────────────────────────── shaping ─────────────────────────────

/** Attack / exponential-decay envelope (times in seconds). */
export function env(buf: Buf, attack = 0.002, decay = 0.2, hold = 0): Buf {
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    let g: number;
    if (t < attack) g = t / attack;
    else if (t < attack + hold) g = 1;
    else g = Math.exp(-(t - attack - hold) / Math.max(decay, 1e-4));
    buf[i] *= g;
  }
  return buf;
}

/** Arbitrary gain curve g(t). */
export function shape(buf: Buf, g: (t: number) => number): Buf {
  for (let i = 0; i < buf.length; i++) buf[i] *= g(i / SR);
  return buf;
}

export const gain = (buf: Buf, g: number) => {
  for (let i = 0; i < buf.length; i++) buf[i] *= g;
  return buf;
};

/** Soft saturation. */
export function drive(buf: Buf, amount = 2): Buf {
  const n = Math.tanh(amount);
  for (let i = 0; i < buf.length; i++) buf[i] = Math.tanh(buf[i] * amount) / n;
  return buf;
}

/** Bit + sample-rate reduction (glitch). */
export function crush(buf: Buf, bits = 5, hold = 6): Buf {
  const q = 2 ** (bits - 1);
  let v = 0;
  for (let i = 0; i < buf.length; i++) {
    if (i % hold === 0) v = Math.round(buf[i] * q) / q;
    buf[i] = v;
  }
  return buf;
}

export type FilterType = "lowpass" | "highpass" | "bandpass";

/** RBJ biquad with a (possibly time-varying) cutoff, coefficients refreshed every 16 samples. */
export function filter(buf: Buf, type: FilterType, freq: Curve, q = 0.707): Buf {
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    a1 = 0,
    a2 = 0;
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
  const update = (f: number) => {
    const w = (2 * Math.PI * Math.min(Math.max(f, 20), SR * 0.45)) / SR;
    const cos = Math.cos(w);
    const alpha = Math.sin(w) / (2 * q);
    const a0 = 1 + alpha;
    if (type === "lowpass") {
      b0 = (1 - cos) / 2 / a0;
      b1 = (1 - cos) / a0;
      b2 = b0;
    } else if (type === "highpass") {
      b0 = (1 + cos) / 2 / a0;
      b1 = -(1 + cos) / a0;
      b2 = b0;
    } else {
      b0 = alpha / a0;
      b1 = 0;
      b2 = -alpha / a0;
    }
    a1 = (-2 * cos) / a0;
    a2 = (1 - alpha) / a0;
  };
  for (let i = 0; i < buf.length; i++) {
    if (i % 16 === 0) update(val(freq, i / SR));
    const x = buf[i];
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    buf[i] = y;
  }
  return buf;
}

/** Feedback echo (cheap space / tail). */
export function echo(buf: Buf, time = 0.09, feedback = 0.35, wet = 0.35, tail = 0.6): Buf {
  const d = samples(time);
  const out = new Float32Array(buf.length + samples(tail));
  out.set(buf);
  const line = new Float32Array(out.length);
  for (let i = 0; i < out.length; i++) {
    const delayed = i >= d ? line[i - d] : 0;
    line[i] = (i < buf.length ? buf[i] : 0) + delayed * feedback;
    out[i] = (i < buf.length ? buf[i] : 0) + delayed * wet;
  }
  return out;
}

/** Mix layers: [buffer, gain, offsetSeconds]. */
export function mix(...layers: [Buf, number?, number?][]): Buf {
  let length = 0;
  for (const [b, , off = 0] of layers) length = Math.max(length, samples(off) + b.length);
  const out = new Float32Array(length);
  for (const [b, g = 1, off = 0] of layers) {
    const o = samples(off);
    for (let i = 0; i < b.length; i++) out[o + i] += b[i] * g;
  }
  return out;
}

/** Peak-normalise and add a 4ms fade-out so nothing clicks. */
export function finish(buf: Buf, peak = 0.89): Buf {
  let m = 0;
  for (let i = 0; i < buf.length; i++) m = Math.max(m, Math.abs(buf[i]));
  const g = m > 0 ? peak / m : 1;
  const fade = samples(0.004);
  for (let i = 0; i < buf.length; i++) {
    const f = i > buf.length - fade ? (buf.length - i) / fade : 1;
    buf[i] *= g * f;
  }
  return buf;
}

/** Semitone → frequency ratio. */
export const st = (n: number) => 2 ** (n / 12);
