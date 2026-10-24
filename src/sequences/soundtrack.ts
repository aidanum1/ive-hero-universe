/**
 * Soundtracks — cue sheets for every sequence, keyed to the same beat constants the
 * visuals use, so picture and sound can never drift apart. Played by Remotion (<Audio>)
 * and by the website's GSAP sequence clock (Web Audio synth).
 */
import { semis, shift, type Cue } from "@/audio/cues";
import { heroById, heroes } from "@/heroes/roster";
import type { HeroId } from "@/heroes/types";
import { POWER } from "./PowerBurst";
import { YUJIN_BEATS as B } from "./YujinGlitch";
import { HS, HS_CONFIRM } from "./HeroSelectVertical";
import { SIX, SIX_OUTRO } from "./SixHeroesIntro";
import { TC, TC_GRID } from "./HeroTradingCards";
import { TRAILER as T } from "./FakeHeroTrailer";

export function yujinGlitchCues(): Cue[] {
  return [
    { at: 0, sound: "type", volume: 0.6 },
    { at: B.freeze, sound: "freeze", volume: 0.55 },
    { at: B.separate, sound: "zip", rate: 0.8 },
    { at: B.echoes + 4, sound: "whoosh" },
    { at: B.displace, sound: "glitch" },
    { at: B.tear, sound: "tear" },
    { at: B.streak, sound: "zap" },
    { at: B.land, sound: "impact", volume: 0.45 },
    { at: B.impact, sound: "bigImpact" },
    { at: B.wipe, sound: "wipe", volume: 0.7 },
    { at: B.card, sound: "stamp", volume: 0.8 },
    { at: B.card + 6, sound: "deal" },
    { at: B.card + 18, sound: "pop" },
    { at: B.card + 22, sound: "glint" },
  ];
}

/** The signature move of each hero, relative to POWER.fx. */
function signature(id: HeroId): Cue[] {
  const fx = POWER.fx;
  switch (heroById[id].powerFX.kind) {
    case "glitch":
      return [
        { at: fx, sound: "glitch" },
        { at: fx + 9, sound: "tear", volume: 0.7 },
        { at: fx + 12, sound: "zap" },
      ];
    case "gust":
      return [{ at: fx - 2, sound: "gust" }];
    case "shot":
      return [0, 8, 16].map((d, i) => ({ at: fx + d, sound: "shot" as const, rate: 1 + i * 0.06, volume: 0.7 }));
    case "slash":
      return [
        { at: fx, sound: "slash" },
        { at: fx + 8, sound: "glint", volume: 0.8 },
      ];
    case "target":
      return [
        { at: fx, sound: "tick" },
        { at: fx + 4, sound: "tick", rate: 1.2 },
        { at: fx + 8, sound: "whoosh", rate: 1.6, volume: 0.6 },
        { at: fx + 13, sound: "tok" },
      ];
    case "thread":
      return [
        { at: fx, sound: "zip", rate: 0.7, volume: 0.6 },
        { at: fx + 4, sound: "whirl" },
      ];
  }
}

export function powerCues(id: HeroId, showCard = true): Cue[] {
  const cues: Cue[] = [
    { at: 0, sound: "charge", rate: 3.2, volume: 0.7 },
    { at: POWER.freeze, sound: "freeze", rate: 2, volume: 0.5 },
    { at: POWER.freeze + 1, sound: "impact" },
    ...signature(id),
    { at: POWER.sfx, sound: "pop" },
  ];
  if (showCard) cues.push({ at: POWER.card, sound: "wipe" }, { at: POWER.card + 4, sound: "stamp", volume: 0.7 });
  return cues;
}

export function heroSelectCues(): Cue[] {
  const cues: Cue[] = heroes.map((h, i) => ({ at: 2 + i * 2, sound: "barSlam", rate: semis(h.sound.note), volume: 0.6 }));
  heroes.forEach((h, i) => {
    const start = HS.intro + i * HS.slot;
    cues.push(
      { at: start, sound: "cursor", rate: semis(h.sound.note) },
      { at: start + 1, sound: "whoosh", volume: 0.5 },
      { at: start + Math.max(2, h.motionPersonality.enterFrames - 4), sound: h.sound.entrance, volume: 0.8 },
      { at: start + h.motionPersonality.enterFrames, sound: "pop", volume: 0.7 },
    );
  });
  const final = HS.intro + HS.slot * heroes.length;
  cues.push(
    { at: final, sound: "cursor" },
    { at: final + 4, sound: "zip" },
    { at: HS_CONFIRM, sound: "confirm" },
    { at: HS_CONFIRM, sound: "bigImpact", volume: 0.8 },
    { at: HS_CONFIRM + 2, sound: "stamp" },
  );
  return cues;
}

export function sixHeroesCues(): Cue[] {
  const title: Cue[] = [
    ...heroes.map((h, i) => ({ at: i * 1.5, sound: "barSlam" as const, rate: semis(h.sound.note), volume: 0.55 })),
    { at: 14, sound: "wipe" },
    { at: 24, sound: "bigImpact" },
    { at: 29, sound: "impact", rate: 1.12, volume: 0.6 },
    { at: 34, sound: "impact", rate: 1.26, volume: 0.55 },
    { at: 40, sound: "collide", volume: 0.75 },
    { at: SIX.title - 9, sound: "riser", rate: 4, volume: 0.6 },
  ];
  const powers = heroes.flatMap((h, i) => shift(powerCues(h.id), SIX.title + i * SIX.per));
  const outro: Cue[] = [
    ...heroes.map((h, i) => ({ at: SIX_OUTRO + i * 2, sound: "pop" as const, rate: semis(h.sound.note), volume: 0.7 })),
    { at: SIX_OUTRO + 16, sound: "braam" },
    { at: SIX_OUTRO + 24, sound: "ting", volume: 0.6 },
  ];
  return [...title, ...powers, ...outro];
}

export function tradingCardsCues(): Cue[] {
  const cues: Cue[] = [{ at: 0, sound: "drone", volume: 0.5 }];
  heroes.forEach((h, i) => {
    cues.push({ at: TC.deal + i * 3, sound: "deal", rate: 1 + i * 0.05 });
    cues.push({ at: TC.fan - 8 + i * 1.5, sound: "flip", rate: semis(h.sound.note / 2) });
    const s = TC.fan + i * TC.spot;
    cues.push({ at: s, sound: "whoosh", volume: 0.6 }, { at: s + 6, sound: "flip" }, { at: s + 10, sound: "pop", rate: semis(h.sound.note), volume: 0.6 }, { at: s + 12, sound: "glint" });
  });
  cues.push(
    ...heroes.map((_, i) => ({ at: TC_GRID + i * 2, sound: "deal" as const, rate: 1.2, volume: 0.6 })),
    { at: TC_GRID + 10, sound: "ting" },
    { at: TC_GRID + 20, sound: "glint" },
  );
  return cues;
}

export function trailerCues(): Cue[] {
  const glitchWindow = yujinGlitchCues()
    .filter((c) => c.at >= 36 && c.at <= 96)
    .map((c) => ({ ...c, at: T.glitch + ((c.at - 36) / 60) * (T.montage - T.glitch) }));
  return [
    ...Array.from({ length: 15 }, (_, i) => ({ at: 2 + i * 1.2, sound: "type" as const, volume: 0.5 })),
    ...heroes.map((h, i) => ({ at: 20 + i, sound: "barSlam" as const, rate: semis(h.sound.note), volume: 0.5 })),
    { at: 26, sound: "bigImpact" },
    { at: T.card1, sound: "drone" },
    { at: T.card1 + 2, sound: "braam" },
    ...heroes.map((h, i) => ({ at: T.flashes + i * 8, sound: "impact" as const, rate: semis(h.sound.note), volume: 0.75 })),
    { at: T.card2, sound: "drone" },
    { at: T.card2 + 2, sound: "braam", rate: semis(2) },
    { at: T.comic, sound: "pageTurn" },
    { at: T.comic + 24, sound: "whoosh" },
    { at: T.comic + 52, sound: "shot" },
    { at: T.comic + 80, sound: "whoosh" },
    { at: T.comic + 104, sound: "pop" },
    { at: T.twist, sound: "drone", volume: 0.6 },
    { at: T.twist2, sound: "freeze" },
    { at: T.twist2 + 14, sound: "glitch" },
    ...glitchWindow,
    ...heroes.map((h, i) => ({ at: T.montage + i * 8, sound: h.sound.power, volume: 0.85 })),
    { at: T.title - 60, sound: "riser", volume: 0.8 },
    { at: T.title + 6, sound: "bigImpact" },
    { at: T.title + 16, sound: "bigImpact", rate: 0.85, volume: 0.75 },
    { at: T.title + 17, sound: "braam", volume: 0.8 },
    { at: T.poster, sound: "ting" },
    { at: T.poster + 2, sound: "drone" },
    { at: T.outro, sound: "confirm" },
  ];
}
