import { owner } from "./project";

/**
 * Real-world release facts for the "Looks Can Kill" era, gathered from public reporting
 * (see references/SOURCES.md). Everything else in this project is fan fiction.
 */
export const release = {
  artist: "IVE",
  title: "LOOKS CAN KILL",
  format: "5TH MINI ALBUM",
  concept: "GIRL HERO",
  /** 26 Oct 2026, 18:00 KST. */
  releaseAt: "2026-10-26T18:00:00+09:00",
  /** Pre-release title track + MV: 19 Oct 2026, 18:00 KST. */
  preReleaseAt: "2026-10-19T18:00:00+09:00",
  tracks: [
    { no: 1, title: "Looks Can Kill", note: "Title · pre-release" },
    { no: 2, title: "Mirror Mirror" },
    { no: 3, title: "SNAKESKIN" },
    { no: 4, title: "CRUMBS" },
    { no: 5, title: "Girls Girls Girls" },
    { no: 6, title: "Glow Motion" },
  ],
  message: "Anyone can be the main character — and the hero — of their own life.",
  phases: ["POST CREDIT SCENE", "GIRL HERO", "HERO TRAINING CENTER", "HERO COMICS", "HERO ON SET"],
} as const;

export type ReleaseState = "countdown" | "released";

export function releaseState(now: number = Date.now()): ReleaseState {
  return now >= Date.parse(release.releaseAt) ? "released" : "countdown";
}

export function timeLeft(now: number = Date.now()) {
  const ms = Math.max(0, Date.parse(release.releaseAt) - now);
  const s = Math.floor(ms / 1000);
  return { ms, days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export const disclaimer = {
  short: "UNOFFICIAL FAN-MADE PROJECT",
  long:
    `IVE HERO UNIVERSE is an unofficial, non-commercial fan-made project created and owned by ${owner.handle} (${owner.platform}). ` +
    "It is not affiliated with, endorsed by or connected to IVE, Starship Entertainment or any related company. Hero names reference IVE's public “Looks Can Kill” concept; all illustrations, emblems, masks, stories and motion pieces here are original fan interpretations. No official photography or footage is used.",
} as const;
