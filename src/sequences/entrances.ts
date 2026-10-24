/**
 * Frame-driven motion personalities — the video twin of web/motion/personalities.ts.
 * Given a hero and the local frame since her cue, returns the transform of her figure
 * and of her temporal echoes. Same data (hero.motionPersonality), same curves.
 */
import type { Hero } from "@/heroes/types";
import { ease } from "@/design/motion";
import { clamp, keys, prog } from "@/lib/timeline";

export type FigureState = {
  dx: number;
  dy: number;
  scale: number;
  sx: number;
  sy: number;
  opacity: number;
  /** 0..1 horizontal reveal (gust wipe); 1 = fully shown. */
  reveal: number;
  /** Echo offsets (dx) and opacities, nearest first. */
  echoes: { dx: number; dy: number; opacity: number }[];
  /** 0..1 strength of an accessory (rings, rope, glint, flash, gust arcs). */
  accent: number;
};

/** `t` = frames since cue. `travel` = px the figure travels on entry. */
export function entranceAt(hero: Hero, t: number, travel = 700): FigureState {
  const mp = hero.motionPersonality;
  const [dirX, dirY] = mp.direction;
  const base: FigureState = { dx: 0, dy: 0, scale: 1, sx: 1, sy: 1, opacity: t < 0 ? 0 : 1, reveal: 1, echoes: [], accent: 0 };
  if (t < 0) return base;
  const len = mp.enterFrames;

  switch (mp.kind) {
    case "velocity": {
      const p = prog(t, 0, len, "punch");
      base.dx = -travel * dirX * (1 - p);
      base.echoes = Array.from({ length: mp.echoes }, (_, k) => {
        const pe = prog(t - (k + 1) * 1.6, 0, len, "punch");
        return { dx: -travel * dirX * (1 - pe) - (k + 1) * 26, dy: 0, opacity: (1 - prog(t, len, 10)) * (0.7 - k * 0.12) };
      });
      break;
    }
    case "gust": {
      base.reveal = prog(t, mp.hold * 0.4, len, "glide");
      base.accent = prog(t, 2, 16, "glide");
      break;
    }
    case "snap": {
      const p = prog(t, 0, len, ease.onTwos);
      base.dy = 420 * (1 - p);
      base.scale = keys(t, [0, len * 0.7, len + 3], [0.92, 1.05, 1], ["onTwos", "overshoot"]);
      base.accent = t > 5 && t < 9 ? 1 : 0;
      break;
    }
    case "glamour": {
      const p = prog(t, 0, len, "glide");
      base.scale = 1.14 - 0.14 * p;
      base.opacity = p;
      base.accent = prog(t, mp.hold, 14, "glide");
      break;
    }
    case "precision": {
      base.accent = prog(t, 0, 8, "snap");
      const p = prog(t, mp.hold, len, "snap");
      base.dx = 360 * -dirX * (1 - p);
      base.opacity = t >= mp.hold ? 1 : 0;
      break;
    }
    case "bounce": {
      const p = prog(t, 2, len, "bounce");
      base.dy = -900 * (1 - p) * (dirY < 0 ? 1 : -1);
      base.sy = keys(t, [6, 9, 16], [1, 0.9, 1], ["punch", "overshoot"]);
      base.sx = keys(t, [6, 9, 16], [1, 1.06, 1], ["punch", "overshoot"]);
      base.accent = clamp(1 - prog(t, 18, 8));
      base.echoes = Array.from({ length: mp.echoes }, (_, k) => {
        const pe = prog(t - (k + 1) * 2, 2, len, "bounce");
        return { dx: 0, dy: -900 * (1 - pe), opacity: (1 - prog(t, 8, 6)) * (0.5 - k * 0.15) };
      });
      break;
    }
  }
  return base;
}
