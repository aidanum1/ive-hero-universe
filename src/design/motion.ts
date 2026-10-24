/**
 * Motion language tokens.
 *
 * All choreography is authored in BASE FRAMES at 30fps — the cadence of the video
 * output. The website converts frames → seconds for GSAP (sec()), and frame-driven
 * sequences played at other fps scale through toBaseFrame().
 */
import { cubicBezier, elastic, linear, stepped, type EaseFn } from "@/lib/ease";

export const BASE_FPS = 30;

/** Durations in base frames. */
export const dur = {
  /** A single flash frame. */
  flash: 1,
  /** Impact frame hold (inverted / burst frame). */
  impact: 2,
  /** Hard snap: cuts, cursor jumps. */
  snap: 5,
  quick: 8,
  base: 12,
  slow: 20,
  linger: 36,
  /** Freeze/hold before a hit lands. */
  hold: 8,
  /** Default stagger between siblings. */
  stagger: 2,
} as const;

/** Frames → seconds (for GSAP). */
export const sec = (frames: number) => frames / BASE_FPS;

/** Convert a frame at any fps into base frames (fractional). */
export const toBaseFrame = (frame: number, fps: number) => (frame * BASE_FPS) / fps;

/** Bezier definitions — kept as numbers so they can also be emitted as CSS. */
export const curve = {
  /** Aggressive in-out for wipes and cuts. */
  snap: [0.75, 0, 0.1, 1],
  /** Instant attack, long tail — impacts and slams. */
  punch: [0.15, 0.95, 0.15, 1],
  /** Overshoot then settle — the signature hero entrance. */
  overshoot: [0.28, 1.7, 0.42, 1],
  overshootSoft: [0.32, 1.32, 0.56, 1],
  /** Expo-out editorial glide. */
  glide: [0.16, 1, 0.3, 1],
  /** Wind-up before release. */
  anticipate: [0.55, -0.45, 0.35, 1.25],
  /** Accelerating exit. */
  accel: [0.6, 0, 0.9, 0.35],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export type CurveName = keyof typeof curve;

const fromCurve = (c: readonly [number, number, number, number]) => cubicBezier(c[0], c[1], c[2], c[3]);

export const ease = {
  linear,
  snap: fromCurve(curve.snap),
  punch: fromCurve(curve.punch),
  overshoot: fromCurve(curve.overshoot),
  overshootSoft: fromCurve(curve.overshootSoft),
  glide: fromCurve(curve.glide),
  anticipate: fromCurve(curve.anticipate),
  accel: fromCurve(curve.accel),
  bounce: elastic(1, 0.38),
  /** Two-frame stepping applied over a glide: hand-animated feel. */
  onTwos: stepped(6, fromCurve(curve.glide)),
} satisfies Record<string, EaseFn>;

export type EaseName = keyof typeof ease;

/** CSS cubic-bezier() strings for stylesheets. */
export const cssEase = Object.fromEntries(
  Object.entries(curve).map(([k, v]) => [k, `cubic-bezier(${v.join(",")})`]),
) as Record<CurveName, string>;
