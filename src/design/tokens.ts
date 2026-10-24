/**
 * IVE HERO UNIVERSE — core visual tokens.
 * Shared by the Next.js site, the Remotion compositions and the WebGL card textures.
 * Hero-specific colours live in src/heroes/roster.ts.
 */

export const color = {
  ink: "#0E0D12",
  inkSoft: "#1B1A22",
  paper: "#F2EDE3",
  paperDeep: "#E4DCCD",
  newsprint: "#CFC6B5",
  chrome: "#C3C7D0",
  chromeDeep: "#7E8494",
  white: "#FFFFFF",
  /** Lipstick red for portrait illustrations. */
  lip: "#E0284A",
  /** Pastel "hero academy" floor tones (from the GIRL HERO set palette). */
  lilac: "#E7DDF7",
  blush: "#FFE1EE",
  teal: "#2FBFB4",
  /** Process "signal" red used for REC / LIVE / warning tags only. */
  signal: "#FF2B2B",
  /** CMYK-ish misregistration plates used for chromatic separation. */
  plateCyan: "#00B8F0",
  plateMagenta: "#FF0A8C",
  plateYellow: "#FFE600",
} as const;

/** 4px base spacing scale. Index = step. */
export const space = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192] as const;
export const sp = (step: number) => space[step] ?? step * 16;

export const radius = {
  none: 0,
  chip: 2,
  card: 18,
} as const;

/** Stroke weights for the comic ink line system (px at 1x). */
export const ink = {
  hair: 1,
  line: 2,
  panel: 4,
  heavy: 7,
} as const;

export const breakpoint = {
  phone: 0,
  tablet: 720,
  desktop: 1100,
  wide: 1600,
} as const;

export const mq = {
  tablet: `(min-width: ${breakpoint.tablet}px)`,
  desktop: `(min-width: ${breakpoint.desktop}px)`,
  reduce: "(prefers-reduced-motion: reduce)",
  coarse: "(pointer: coarse)",
} as const;

export const z = {
  base: 0,
  fx: 10,
  hud: 50,
  nav: 80,
  overlay: 90,
  curtain: 100,
} as const;

/**
 * Effect intensity. Every FX component reads its strength from here so the whole
 * universe can be dialled up (video) or down (mobile / reduced motion) in one place.
 */
export const fx = {
  halftoneOpacity: 0.22,
  grainOpacity: 0.12,
  /** Max chromatic separation offset in px. Used sparingly on impacts only. */
  chroma: 6,
  speedLineCount: 54,
  echoCount: 5,
  shake: 10,
  glint: 0.85,
} as const;

export type FxProfile = { [K in keyof typeof fx]: number };

export const fxProfile = {
  video: { ...fx, chroma: 10, shake: 16, speedLineCount: 72 },
  desktop: { ...fx },
  mobile: { ...fx, speedLineCount: 36, echoCount: 4, shake: 6, chroma: 4 },
  reduced: { ...fx, speedLineCount: 0, echoCount: 0, shake: 0, chroma: 0, grainOpacity: 0.08 },
} satisfies Record<string, FxProfile>;

/** Vertical social video canvas. */
export const video = {
  width: 1080,
  height: 1920,
  /** Safe area for key text on 1080-wide vertical video. */
  safeX: 84,
  safeTop: 150,
  safeBottom: 220,
} as const;
