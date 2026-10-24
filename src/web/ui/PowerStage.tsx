"use client";
/**
 * Plays a hero's power sequence on the website — the exact frame-driven component that
 * Remotion renders, clocked by GSAP at display refresh rate.
 * Yujin gets the full YUJIN GLITCH; everyone else their POWER BURST.
 */
import { useEffect, useMemo } from "react";
import type { HeroId } from "@/heroes/types";
import { POWER_DURATION, PowerBurst } from "@/sequences/PowerBurst";
import { YUJIN_GLITCH_DURATION, YujinGlitch } from "@/sequences/YujinGlitch";
import { powerCues, yujinGlitchCues } from "@/sequences/soundtrack";
import { fxProfile } from "@/design/tokens";
import { useSequenceClock } from "../motion/useSequenceClock";
import { useMedia, useReducedMotion } from "../hooks/useMedia";
import s from "./PowerStage.module.css";

export const powerDuration = (id: HeroId) => (id === "yujin" ? YUJIN_GLITCH_DURATION : POWER_DURATION);

export function PowerStage({ heroId, runId, onDone }: { heroId: HeroId; runId: number; onDone: () => void }) {
  const duration = powerDuration(heroId);
  const cues = useMemo(() => (heroId === "yujin" ? yujinGlitchCues() : powerCues(heroId)), [heroId]);
  const { frame, play, seek } = useSequenceClock(duration, cues);
  const reduce = useReducedMotion();
  const phone = !useMedia("(min-width: 720px)", true);
  const fx = reduce ? fxProfile.reduced : phone ? fxProfile.mobile : fxProfile.desktop;

  useEffect(() => {
    if (reduce) {
      seek(duration - 1);
      const t = window.setTimeout(onDone, 2200);
      return () => window.clearTimeout(t);
    }
    play(0, () => window.setTimeout(onDone, 500));
  }, [runId, reduce, duration, play, seek, onDone]);

  return (
    <div className={s.stage} role="img" aria-label="Hero power sequence">
      <div className={s.frame}>
        {heroId === "yujin" ? <YujinGlitch frame={frame} fx={fx} /> : <PowerBurst frame={frame} heroId={heroId} fx={fx} />}
      </div>
      <button type="button" className={s.skip} onClick={onDone}>
        SKIP ▸▸
      </button>
    </div>
  );
}
