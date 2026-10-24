export const motion = {
  chargeMs: 900,
  burstMs: 860,
  cancelMs: 180,
  scrollScrub: 0.16,
  scrollScreens: 6,
  cancelDistance: 12,
  ranges: {
    finish: [0.84, 0.98],
    departure: [0.8, 0.94],
    hero: [0.42, 0.56],
    pageTravel: [0.05, 0.35],
    pageSplit: [0.26, 0.42],
    pageFade: [0.38, 0.45],
    title: [0.43, 0.58],
    prologueFade: [0.28, 0.4],
    purpleFade: [0.39, 0.46],
    wipe: [0.35, 0.43],
  },
  pose: {
    heroRestScale: 0.94,
    heroBurstScale: 1.5,
    chargeScale: 0.025,
    exitX: -75,
    exitY: 12,
    cameraPunch: 0.32,
  },
  reduced: { departureAt: 0.87, pageAt: 0.15, pageTravel: 0.55 },
  beats: {
    signal: 0,
    approach: 0.08,
    split: 0.26,
    purple: 0.42,
    ready: 0.6,
    departure: 0.8,
    end: 1,
  },
  burst: {
    freeze: 80,
    echo: 180,
    tear: 300,
    impactEnd: 340,
    exit: 620,
    end: 860,
  },
} as const;

export const cameraRigs = {
  desktop: {
    x: [-0.5, 0.2],
    y: 0,
    z: [20, 5.5],
    targetX: [0, 0.3],
    groupX: [3.4, 0],
    groupY: [0.1, 0.1],
  },
  mobile: {
    x: [0, 0],
    y: 0.1,
    z: [31, 6],
    targetX: [0, 0],
    groupX: [0.8, 0],
    groupY: [-2, 0],
  },
  rotation: [-0.04, -0.22, 0.13],
  depth: {
    paper: -1,
    hero: 1.5,
    foreground: 3.3,
    heroBase: 0.06,
    foregroundBase: 0.13,
    heroTwist: -0.035,
    foregroundTwist: 0.13,
  },
} as const;
export const clamp = (n: number, lo = 0, hi = 1) =>
  Math.min(hi, Math.max(lo, n));
export const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const smooth = (p: number) => p * p * (3 - 2 * p);
export const out = (p: number) => 1 - (1 - clamp(p)) ** 3;

export type ActionState = "idle" | "charging" | "bursting" | "completed";
export type SceneId = "signal" | "purple" | "released";
export interface MotionInput {
  progress: number;
  charge: number;
  eventMs: number;
  action: ActionState;
  reduced: boolean;
  pointerX: number;
  pointerY: number;
}
export interface VisualState {
  progress: number;
  scene: SceneId;
  pageTravel: number;
  pageSplit: number;
  pageOpacity: number;
  heroReveal: number;
  heroOpacity: number;
  heroScale: number;
  heroX: number;
  heroY: number;
  titleReveal: number;
  prologueOpacity: number;
  purpleOpacity: number;
  finish: number;
  energy: number;
  echo: number;
  tear: number;
  impact: number;
  streak: number;
  cameraPunch: number;
  charge: number;
  reduced: boolean;
  pointerX: number;
  pointerY: number;
}
