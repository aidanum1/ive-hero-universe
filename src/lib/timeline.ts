/**
 * Frame helpers for deterministic, frame-driven choreography.
 * Pure functions: usable from Remotion, @remotion/player and GSAP-driven web playback.
 */
import { ease as easeMap, type EaseName } from "@/design/motion";
import type { EaseFn } from "@/lib/ease";
import { rand } from "@/lib/random";

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  lerp(outMin, outMax, clamp((v - inMin) / (inMax - inMin || 1)));

const resolveEase = (e: EaseName | EaseFn | undefined): EaseFn =>
  typeof e === "function" ? e : easeMap[e ?? "linear"];

/** Eased 0→1 progress of `frame` across [start, start+duration]. */
export function prog(frame: number, start: number, duration: number, e?: EaseName | EaseFn) {
  return resolveEase(e)(clamp((frame - start) / Math.max(duration, 1e-6)));
}

/** Multi-keyframe interpolation with per-segment easing. Clamped at both ends. */
export function keys(
  frame: number,
  input: readonly number[],
  output: readonly number[],
  eases?: (EaseName | EaseFn)[] | EaseName | EaseFn,
) {
  if (frame <= input[0]) return output[0];
  const last = input.length - 1;
  if (frame >= input[last]) return output[last];
  let i = 0;
  while (i < last - 1 && frame >= input[i + 1]) i++;
  const e = Array.isArray(eases) ? eases[i] : eases;
  const t = resolveEase(e)((frame - input[i]) / (input[i + 1] - input[i]));
  return lerp(output[i], output[i + 1], t);
}

/** True while frame is inside [start, start+duration). */
export const within = (frame: number, start: number, duration: number) => frame >= start && frame < start + duration;

/** Quantise time to hold frames: posterised "on twos" motion. */
export const onN = (frame: number, n: number) => Math.floor(frame / n) * n;

/** Deterministic per-frame jitter in [-1,1], stepping every `n` frames. */
export const jitter = (frame: number, seed: string | number, n = 1) => rand(`${seed}:${onN(frame, n)}`) * 2 - 1;

/** Decaying camera shake offset (px) for an impact at `at`. */
export function shake(frame: number, at: number, strength: number, decayFrames = 10, seed = "shake") {
  const t = frame - at;
  if (t < 0 || t > decayFrames) return { x: 0, y: 0 };
  const k = strength * (1 - t / decayFrames) ** 2;
  return { x: jitter(frame, `${seed}x`) * k, y: jitter(frame, `${seed}y`) * k };
}

/** Square-wave flicker: on for `on` frames, off for `off` frames. */
export const blink = (frame: number, on = 8, off = 6, start = 0) =>
  frame < start ? false : (frame - start) % (on + off) < on;
