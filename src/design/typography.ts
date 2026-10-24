/**
 * Typography system.
 *  display — Dela Gothic One: heavy, game-title / comic impact lettering.
 *  wide    — Archivo (variable width): fashion-editorial grotesk, used expanded for decks & labels.
 *  serif   — Bodoni Moda: high-fashion italic voice for taglines & pull quotes.
 *  pixel   — DotGothic16: PS2-era HUD / system text. Small doses only.
 *  hangul  — Black Han Sans: Korean display names & SFX lettering.
 *  hangulText — Gothic A1 Bold: small Korean copy.
 */
import type { CSSProperties } from "react";

export const family = {
  display: "'IVE Display', 'IVE Hangul', 'Arial Black', sans-serif",
  wide: "'IVE Wide', 'IVE Hangul Text', 'Helvetica Neue', Arial, sans-serif",
  serif: "'IVE Serif', 'Didot', 'Bodoni 72', Georgia, serif",
  pixel: "'IVE Pixel', 'IVE Hangul', ui-monospace, monospace",
  hangul: "'IVE Hangul', 'IVE Display', sans-serif",
  /** Small Korean copy (Gothic A1 Bold) — Black Han Sans smears below ~20px. */
  hangulText: "'IVE Hangul Text', 'IVE Wide', sans-serif",
} as const;

type TypeStyle = Pick<
  CSSProperties,
  "fontFamily" | "fontWeight" | "fontStyle" | "fontStretch" | "letterSpacing" | "lineHeight" | "textTransform"
>;

/** Named text roles. Sizes are applied separately (fluid on web, fixed px in video). */
export const role = {
  /** Giant impact titles: IVE, hero names. */
  impact: { fontFamily: family.display, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 0.86, textTransform: "uppercase" },
  /** Expanded editorial headline. */
  headline: { fontFamily: family.wide, fontWeight: 900, fontStretch: "125%", letterSpacing: "-0.01em", lineHeight: 0.92, textTransform: "uppercase" },
  /** Condensed tall deck — billing blocks, credits. */
  condensed: { fontFamily: family.wide, fontWeight: 800, fontStretch: "62%", letterSpacing: "0em", lineHeight: 0.95, textTransform: "uppercase" },
  /** Fashion italic voice. */
  voice: { fontFamily: family.serif, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.01em", lineHeight: 1.05 },
  /** Running copy. */
  body: { fontFamily: family.wide, fontWeight: 450, fontStretch: "100%", letterSpacing: "0.005em", lineHeight: 1.45 },
  /** Small uppercase labels, tracking wide. */
  label: { fontFamily: family.wide, fontWeight: 700, fontStretch: "112%", letterSpacing: "0.16em", lineHeight: 1.1, textTransform: "uppercase" },
  /** Game HUD / system readouts. */
  hud: { fontFamily: family.pixel, fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1.15, textTransform: "uppercase" },
  /** Korean lettering. */
  hangul: { fontFamily: family.hangul, fontWeight: 400, letterSpacing: "0", lineHeight: 1 },
} satisfies Record<string, TypeStyle>;

export type Role = keyof typeof role;

/** Fluid web sizes (min px, preferred vw, max px). */
export const fluid = {
  mega: "clamp(5.5rem, 22vw, 22rem)",
  hero: "clamp(3.4rem, 10vw, 9.5rem)",
  h1: "clamp(2.6rem, 6.4vw, 6rem)",
  h2: "clamp(2rem, 4.2vw, 3.8rem)",
  h3: "clamp(1.35rem, 2.2vw, 2rem)",
  lead: "clamp(1.1rem, 1.5vw, 1.4rem)",
  body: "clamp(0.95rem, 1.05vw, 1.05rem)",
  small: "0.8125rem",
  micro: "0.6875rem",
} as const;

/** Fixed video sizes for 1080-wide vertical compositions. */
export const videoSize = {
  mega: 420,
  hero: 190,
  h1: 128,
  h2: 88,
  h3: 60,
  body: 44,
  label: 30,
  micro: 24,
} as const;
