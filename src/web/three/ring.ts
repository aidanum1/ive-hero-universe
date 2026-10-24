/** Shared ring math for the holo-card gallery (kept out of the lazy WebGL chunk). */
import { heroes } from "@/heroes/roster";

export const STEP = (Math.PI * 2) / heroes.length;
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Ring rotation = one showcase revolution on scroll + user drag offset. */
export const ringRotation = (scroll: number, drag: number) => -smooth(clamp01(scroll)) * Math.PI * 2 + drag;
