"use client";
/**
 * Individual hero experience: intro cinematic (her motion personality) → dossier →
 * Remotion power cut → holo card → next/prev hero.
 */
import dynamic from "next/dynamic";
import { heroThemeVars } from "@/design/cssVars";
import { heroById } from "@/heroes/roster";
import type { HeroId } from "@/heroes/types";
import { pieceById } from "@/sequences/registry";
import { SiteNav } from "../ui/SiteNav";
import { CardFlip } from "../ui/CardFlip";
import { HeroIntro } from "./HeroIntro";
import { Dossier } from "./Dossier";
import { HeroNav } from "./HeroNav";
import s from "./HeroPage.module.css";

const MotionPlayer = dynamic(() => import("../ui/MotionPlayer"), {
  ssr: false,
  loading: () => <div className={s.playerLoading}>LOADING CUT…</div>,
});

export function HeroPage({ heroId }: { heroId: HeroId }) {
  const hero = heroById[heroId];
  const piece = heroId === "yujin" ? pieceById.YujinGlitchVertical : pieceById.HeroPowerVertical;

  return (
    <div style={heroThemeVars(hero)} className={s.page}>
      <SiteNav home={false} />
      <main>
        <HeroIntro hero={hero} />
        <Dossier hero={hero} />

        <section className={s.cut} aria-labelledby="cut-title">
          <div className={s.cutCopy}>
            <p className={s.kicker}>MOTION CUT · 1080×1920 · RENDERED WITH REMOTION</p>
            <h2 id="cut-title" className={s.cutTitle}>
              {heroId === "yujin" ? "The Quicksilver Step" : hero.powerFX.name.toLowerCase()}
            </h2>
            <p className={s.cutBody}>
              {heroId === "yujin"
                ? "A fancam that can't keep up. The frame freezes, her silhouette splits off, afterimages trail, the signal tears — and she lands as lightning. Built entirely from graphics, frame by frame."
                : `${hero.powerFX.description} The same frame-driven sequence plays here and renders to vertical MP4.`}
            </p>
            <p className={s.cutMeta}>
              {`EASE ${hero.motionPersonality.enter.toUpperCase()} · ${hero.motionPersonality.enterFrames}F ENTRANCE · ${hero.motionPersonality.echoes} ECHOES · HOLD ${hero.motionPersonality.hold}F`}
            </p>
          </div>
          <div className={s.cutPlayer}>
            <MotionPlayer piece={piece} inputProps={heroId === "yujin" ? {} : { heroId }} sound="muted" />
          </div>
        </section>

        <section className={s.cardSection} aria-labelledby="card-title">
          <div className={s.cardCopy}>
            <p className={s.kicker}>COLLECTOR CARD · {String(hero.index).padStart(2, "0")}/06</p>
            <h2 id="card-title" className={s.cardTitle}>
              Tilt to shine.
              <br />
              Tap to flip.
            </h2>
          </div>
          <div className={s.cardWrap}>
            <CardFlip hero={hero} />
          </div>
        </section>

        <HeroNav hero={hero} />
      </main>
    </div>
  );
}
