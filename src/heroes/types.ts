import type { EaseName } from "@/design/motion";
import type { SoundId } from "@/audio/sounds";

export type HeroId = "yujin" | "gaeul" | "rei" | "wonyoung" | "liz" | "leeseo";

/** Colour roles a shape layer can reference — resolved per hero at render time. */
export type PaintRole = "primary" | "secondary" | "ink" | "paper" | "accent" | "none";

export type ShapeLayer = {
  d: string;
  fill?: PaintRole;
  stroke?: PaintRole;
  strokeWidth?: number;
  fillRule?: "evenodd" | "nonzero";
  /** Optional opacity for highlight / facet layers. */
  opacity?: number;
};

export type ShapeSet = {
  viewBox: string;
  layers: ShapeLayer[];
};

/** A bust illustration built from layered shapes; `src` can override with real artwork later. */
export type PortraitSpec = {
  /** Optional raster artwork in /public. When absent the vector bust is drawn. */
  src?: string;
  hairBack: string;
  hairFront: string;
  /** Extra ornament (bow, buns, ponytail) drawn in `ornamentFill`. */
  ornament?: string;
  ornamentFill?: PaintRole;
  /** Signature-colour hair streak, drawn over the hair in `primary`. */
  streak?: string;
  /** Which side the key light comes from — drives halftone shading. */
  light: "left" | "right";
};

export type TextureKind = "speed" | "hatch" | "zigzag" | "diamond" | "rings" | "dots";

export type TextureSpec = {
  kind: TextureKind;
  /** Degrees. */
  angle: number;
  /** Pattern cell size in px at 1x. */
  scale: number;
};

export type MotionKind = "velocity" | "gust" | "snap" | "glamour" | "precision" | "bounce";

export type MotionPersonality = {
  kind: MotionKind;
  /** Short description used in UI / docs. */
  note: string;
  enter: EaseName;
  exit: EaseName;
  /** Entrance length in base frames. */
  enterFrames: number;
  /** Direction of travel for entrances, unit-ish vector. */
  direction: [number, number];
  /** Number of temporal echoes trailing motion. */
  echoes: number;
  /** Camera shake strength multiplier on arrival. */
  shake: number;
  /** Frames held still before the hit (anticipation). */
  hold: number;
};

export type PowerFxKind = "glitch" | "gust" | "shot" | "slash" | "target" | "thread";

export type PowerFX = {
  kind: PowerFxKind;
  name: string;
  description: string;
  /** 0–1 multiplier on global fx intensity. */
  intensity: number;
};

export type StatKey = "speed" | "power" | "glamour" | "precision" | "focus" | "energy";

export type Hero = {
  id: HeroId;
  /** 1-based roster number. */
  index: number;
  name: string;
  nameKo: string;
  heroName: string;
  /** Element kanji used as a game-UI glyph. */
  glyph: string;
  /** Official hero name from the GIRL HERO concept, in Korean. */
  heroNameKo: string;
  heroClass: string;
  tagline: string;
  bio: string;
  primaryColor: string;
  secondaryColor: string;
  /** Text colour that reads on `primaryColor`. */
  onPrimary: string;
  /** Third accent used for details / lips / rim light. */
  accentColor: string;
  /** Deep shade of the primary for shadows / misregistration plates. */
  deepColor: string;
  logo: ShapeSet;
  mask: ShapeSet;
  portrait: PortraitSpec;
  texture: TextureSpec;
  motionPersonality: MotionPersonality;
  powerFX: PowerFX;
  stats: Record<StatKey, number>;
  sfx: { ko: string; en: string };
  /** Sound identity: her note in the select-screen scale (semitones), entrance and power sounds. */
  sound: { note: number; entrance: SoundId; power: SoundId };
};
