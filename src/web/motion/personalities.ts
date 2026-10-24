"use client";
/**
 * Motion personalities on the web — how each hero ENTERS a frame.
 * Driven by hero.motionPersonality so the select screen, hero pages and any future
 * surface share one choreography per hero.
 */
import type { Hero, MotionKind } from "@/heroes/types";
import { ease, gsap, sec } from "./gsap";

export type EntranceTargets = {
  /** The element that holds the hero's portrait. */
  portrait: Element;
  /** Flat silhouette clones used as temporal echoes (velocity / bounce). */
  echoes?: Element[];
  /** Container that receives camera shake. */
  stage?: Element;
  /** Personality-specific accessory layers (wind arcs, rings, rope, glint…). */
  accents?: Partial<Record<"gust" | "rings" | "rope" | "glint" | "flash", Element | null>>;
};

const shakeStage = (tl: gsap.core.Timeline, stage: Element | undefined, strength: number, at: string | number) => {
  if (!stage || strength <= 0) return;
  tl.fromTo(stage, { x: 12 * strength, y: -6 * strength }, { x: 0, y: 0, duration: sec(10), ease: ease.bounce }, at);
};

type Builder = (tl: gsap.core.Timeline, hero: Hero, t: EntranceTargets, dir: 1 | -1) => void;

const builders: Record<MotionKind, Builder> = {
  // Captain Purple — arrives before the frame does.
  velocity(tl, hero, { portrait, echoes = [], stage }, dir) {
    tl.fromTo(portrait, { xPercent: -95 * dir, autoAlpha: 1 }, { xPercent: 0, duration: sec(hero.motionPersonality.enterFrames), ease: ease.punch }, 0);
    echoes.forEach((e, i) => {
      tl.fromTo(
        e,
        { xPercent: -95 * dir, autoAlpha: 0.85 - i * 0.2 },
        { xPercent: -14 * dir * (i + 1), duration: sec(hero.motionPersonality.enterFrames), ease: ease.punch },
        sec(i + 1),
      ).to(e, { autoAlpha: 0, duration: sec(5), ease: "none" }, ">");
    });
    shakeStage(tl, stage, hero.motionPersonality.shake, sec(hero.motionPersonality.enterFrames - 1));
  },

  // Wonder Green — hold, then a gust sweeps her in.
  gust(tl, hero, { portrait, accents }, dir) {
    tl.set(portrait, { autoAlpha: 1, clipPath: dir > 0 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)" }, 0).to(
      portrait,
      { clipPath: "inset(0% 0% 0% 0%)", duration: sec(hero.motionPersonality.enterFrames), ease: ease.glide },
      sec(hero.motionPersonality.hold * 0.4),
    );
    if (accents?.gust)
      tl.fromTo(accents.gust, { xPercent: -70 * dir, autoAlpha: 1 }, { xPercent: 90 * dir, duration: sec(16), ease: ease.glide }, sec(2)).set(accents.gust, { autoAlpha: 0 });
  },

  // Jean Yellow — pops up on twos, overshoots, muzzle flash.
  snap(tl, hero, { portrait, stage, accents }) {
    tl.fromTo(portrait, { yPercent: 45, scale: 0.92, autoAlpha: 1 }, { yPercent: 0, scale: 1, duration: sec(hero.motionPersonality.enterFrames), ease: ease.onTwos }, 0);
    if (accents?.flash) tl.fromTo(accents.flash, { autoAlpha: 1, scale: 0.4 }, { scale: 1.1, duration: sec(3), ease: ease.punch }, sec(5)).set(accents.flash, { autoAlpha: 0 }, `>+${sec(2)}`);
    shakeStage(tl, stage, hero.motionPersonality.shake, sec(hero.motionPersonality.enterFrames));
  },

  // Bat Pink — slow push, a held beat, one glint.
  glamour(tl, hero, { portrait, accents }) {
    tl.fromTo(portrait, { scale: 1.14, autoAlpha: 0, filter: "brightness(1.6)" }, { scale: 1, autoAlpha: 1, filter: "brightness(1)", duration: sec(hero.motionPersonality.enterFrames), ease: ease.glide }, 0);
    if (accents?.glint) tl.fromTo(accents.glint, { xPercent: -120, autoAlpha: 1 }, { xPercent: 120, duration: sec(14), ease: ease.glide }, sec(hero.motionPersonality.hold)).set(accents.glint, { autoAlpha: 0 });
  },

  // Super Blue — rings lock on, then a dead-straight snap in.
  precision(tl, hero, { portrait, stage, accents }, dir) {
    if (accents?.rings) tl.fromTo(accents.rings, { scale: 2.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: sec(8), ease: ease.snap }, 0).to(accents.rings, { autoAlpha: 0, duration: sec(6) }, `>+${sec(6)}`);
    tl.fromTo(portrait, { xPercent: 40 * dir, autoAlpha: 1 }, { xPercent: 0, duration: sec(hero.motionPersonality.enterFrames), ease: ease.snap }, sec(hero.motionPersonality.hold));
    shakeStage(tl, stage, hero.motionPersonality.shake, `>`);
  },

  // Spider Red — drops in on a rope, elastic recoil.
  bounce(tl, hero, { portrait, stage, accents }) {
    if (accents?.rope) tl.fromTo(accents.rope, { scaleY: 0, autoAlpha: 1 }, { scaleY: 1, duration: sec(4), ease: ease.punch }, 0).to(accents.rope, { autoAlpha: 0, duration: sec(6) }, sec(20));
    tl.fromTo(portrait, { yPercent: -80, autoAlpha: 1 }, { yPercent: 0, duration: sec(hero.motionPersonality.enterFrames), ease: ease.bounce }, sec(2)).fromTo(
      portrait,
      { scaleY: 0.9, scaleX: 1.06 },
      { scaleY: 1, scaleX: 1, duration: sec(8), ease: ease.overshoot, transformOrigin: "50% 100%" },
      sec(6),
    );
    shakeStage(tl, stage, hero.motionPersonality.shake, sec(6));
  },
};

/** Appends the hero's entrance to a timeline. `dir` = travel direction (+1 forward / -1 back). */
export function entrance(tl: gsap.core.Timeline, hero: Hero, targets: EntranceTargets, dir: 1 | -1 = 1) {
  builders[hero.motionPersonality.kind](tl, hero, targets, dir);
  return tl;
}

export { gsap };
