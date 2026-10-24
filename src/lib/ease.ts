/**
 * Renderer-agnostic easing. The same functions drive GSAP (ease: fn) and
 * Remotion/frame sequences (interpolate(..., { easing: fn })).
 */
export type EaseFn = (t: number) => number;

/** CSS-compatible cubic-bezier solver (Newton–Raphson with bisection fallback). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EaseFn {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-6) return t;
      if (x > v) lo = t;
      else hi = t;
      t = (hi - lo) / 2 + lo;
      if (hi - lo < 1e-7) break;
    }
    return t;
  };

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return sampleY(solveX(t));
  };
}

export const linear: EaseFn = (t) => t;

/** Holds each value for `steps` discrete levels — "animating on twos/threes". */
export const stepped =
  (steps: number, ease: EaseFn = linear): EaseFn =>
  (t) =>
    Math.floor(ease(t) * steps) / steps;

/** Damped spring-like overshoot without physics state (deterministic). */
export const elastic =
  (amplitude = 1, period = 0.32): EaseFn =>
  (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const s = (period / (2 * Math.PI)) * Math.asin(1 / Math.max(1, amplitude));
    return amplitude * Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / period) + 1;
  };
