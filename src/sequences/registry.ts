/**
 * Single source of truth for every motion piece: used by Remotion's Root (MP4 renders)
 * and by the website's Motion Theatre (@remotion/player previews).
 */
import type { ComponentType } from "react";
import { BASE_FPS } from "@/design/motion";
import { video } from "@/design/tokens";
import { frameDriven } from "./frameDriven";
import { heroSelectCues, powerCues, sixHeroesCues, tradingCardsCues, trailerCues, yujinGlitchCues } from "./soundtrack";
import type { HeroId } from "@/heroes/types";
import { YUJIN_GLITCH_DURATION, YujinGlitch } from "./YujinGlitch";
import { POWER_DURATION, PowerBurst } from "./PowerBurst";
import { HERO_SELECT_DURATION, HeroSelectVertical } from "./HeroSelectVertical";
import { SIX_HEROES_DURATION, SixHeroesIntro } from "./SixHeroesIntro";
import { TRADING_CARDS_DURATION, HeroTradingCards } from "./HeroTradingCards";
import { TRAILER_DURATION, FakeHeroTrailer } from "./FakeHeroTrailer";

export type MotionPiece = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  component: ComponentType<Record<string, unknown>>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  defaultProps: Record<string, unknown>;
  /** Accent colour used by the theatre UI. */
  accent: string;
};

const vertical = { fps: BASE_FPS, width: video.width, height: video.height };

export const motionPieces: MotionPiece[] = [
  {
    id: "HeroSelectVertical",
    title: "Hero Select",
    kicker: "CHARACTER SELECT",
    description: "The PS2-era select screen as a vertical cut: the cursor visits all six heroes, each entering in her own motion personality, then locks in Captain Purple.",
    component: frameDriven(HeroSelectVertical, "HeroSelectVertical", heroSelectCues) as ComponentType<Record<string, unknown>>,
    durationInFrames: HERO_SELECT_DURATION,
    defaultProps: {},
    accent: "#FF4FA8",
    ...vertical,
  },
  {
    id: "YujinGlitchVertical",
    title: "Quicksilver Step",
    kicker: "YUJIN GLITCH",
    description: "A fancam that drops frames: freeze, silhouette split, afterimages, frame tear, lightning, impact — Captain Purple.",
    component: frameDriven(YujinGlitch, "YujinGlitch", yujinGlitchCues) as ComponentType<Record<string, unknown>>,
    durationInFrames: YUJIN_GLITCH_DURATION,
    defaultProps: {},
    accent: "#7A3CF0",
    ...vertical,
  },
  {
    id: "SixHeroesIntro",
    title: "Six Heroes",
    kicker: "TEAM INTRO",
    description: "Title open with impact-frame slams, then all six signature powers back to back with hard cuts, ending on the team line-up.",
    component: frameDriven(SixHeroesIntro, "SixHeroesIntro", sixHeroesCues) as ComponentType<Record<string, unknown>>,
    durationInFrames: SIX_HEROES_DURATION,
    defaultProps: {},
    accent: "#FFD000",
    ...vertical,
  },
  {
    id: "HeroTradingCards",
    title: "Holo Cards",
    kicker: "TRADING CARDS",
    description: "Six cards dealt face-down into a fan, each pulled into the spotlight with a faux-3D flip and a holographic glint — then the full collector grid.",
    component: frameDriven(HeroTradingCards, "HeroTradingCards", tradingCardsCues) as ComponentType<Record<string, unknown>>,
    durationInFrames: TRADING_CARDS_DURATION,
    defaultProps: {},
    accent: "#2E6BFF",
    ...vertical,
  },
  {
    id: "FakeHeroTrailer",
    title: "The Trailer",
    kicker: "FAKE TRAILER",
    description: "Ident sting, title cards, hard-cut hero flashes, a dolly across the comic page, the on-set twist, the glitch, a power montage and the title slam — ending on the poster.",
    component: frameDriven(FakeHeroTrailer, "FakeHeroTrailer", trailerCues) as ComponentType<Record<string, unknown>>,
    durationInFrames: TRAILER_DURATION,
    defaultProps: {},
    accent: "#FF2B2B",
    ...vertical,
  },
  {
    id: "HeroPowerVertical",
    title: "Power Burst",
    kicker: "HERO POWERS",
    description: "Each hero's signature move: charge, freeze, power, SFX slam, name card.",
    component: frameDriven(PowerBurst, "PowerBurst", (p: { heroId: HeroId }) => powerCues(p.heroId)) as ComponentType<Record<string, unknown>>,
    durationInFrames: POWER_DURATION,
    defaultProps: { heroId: "gaeul" },
    accent: "#12B76A",
    ...vertical,
  },
];

export const pieceById = Object.fromEntries(motionPieces.map((p) => [p.id, p]));
