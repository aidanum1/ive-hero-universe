/**
 * Cue sheets — when each sound fires inside a frame-driven sequence (base frames @30fps).
 * Consumed by Remotion (<Audio> per cue) and by the website's sequence clock (Web Audio).
 */
import type { SoundId } from "./sounds";

export type Cue = {
  /** Base frame (30fps) the sound starts on. */
  at: number;
  sound: SoundId;
  /** 0–1 relative volume. */
  volume?: number;
  /** Playback-rate pitch shift (1 = original). */
  rate?: number;
};

export const shift = (cues: Cue[], by: number): Cue[] => cues.map((c) => ({ ...c, at: c.at + by }));

/** Semitone offset → playback rate. */
export const semis = (n: number) => 2 ** (n / 12);

/** Master level shared by video renders and the web engine (headroom for stacked hits). */
export const MASTER = 0.72;
