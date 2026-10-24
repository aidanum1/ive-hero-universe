import { clamp, motion, out, range } from "./config";

export const impactFrame = (ms: number) =>
  Number(ms >= motion.burst.tear && ms < motion.burst.impactEnd);
export const frameFreeze = (ms: number) =>
  Math.max(0, ms - motion.burst.freeze);
export const temporalEcho = (ms: number) =>
  range(ms, motion.burst.freeze, motion.burst.echo) *
  (1 - range(ms, motion.burst.impactEnd, motion.burst.exit));
export const screenTear = (ms: number) =>
  Number(ms >= motion.burst.echo && ms < motion.burst.tear) *
  (1 - range(ms, motion.burst.echo, motion.burst.tear));
export const speedBurst = (ms: number) =>
  out(range(ms, motion.burst.tear, motion.burst.exit));
export const cameraPunch = (ms: number) =>
  Math.sin(range(ms, motion.burst.echo, motion.burst.exit) * Math.PI) *
  motion.pose.cameraPunch;
export const maskReveal = (p: number) => out(clamp(p));
export const editorialCut = (p: number, threshold: number) =>
  Number(p >= threshold);
export const comicWipe = (p: number) => range(p, ...motion.ranges.wipe);
export const cardGlint = (x: number) => clamp((x + 1) / 2);
