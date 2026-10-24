"use client";
/**
 * MOTION THEATRE — every Remotion composition, playable in the browser through
 * @remotion/player. Retro CRT channel switcher; the Player only mounts near the viewport.
 */
import dynamic from "next/dynamic";
import { useRef, useState, type CSSProperties } from "react";
import { motionPieces } from "@/sequences/registry";
import { heroes } from "@/heroes/roster";
import type { HeroId } from "@/heroes/types";
import { ease, gsap, sec } from "../motion/gsap";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useMedia";
import { sfx } from "../audio/sfx";
import s from "./MotionTheatre.module.css";

const MotionPlayer = dynamic(() => import("../ui/MotionPlayer"), {
  ssr: false,
  loading: () => <div className={s.loading}>TUNING…</div>,
});

export function MotionTheatre() {
  const root = useRef<HTMLElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const near = useInView(root, "400px 0px", true);
  const reduce = useReducedMotion();
  const [channel, setChannel] = useState(0);
  const [heroId, setHeroId] = useState<HeroId>("gaeul");
  const piece = motionPieces[channel];
  const takesHero = "heroId" in piece.defaultProps;

  const tune = (i: number) => {
    if (i === channel) return;
    sfx.play("static", { volume: 0.7 });
    setChannel(i);
    if (!reduce && screen.current) {
      gsap.fromTo(screen.current, { scaleY: 0.02, filter: "brightness(3)" }, { scaleY: 1, filter: "brightness(1)", duration: sec(9), ease: ease.overshootSoft });
    }
  };

  return (
    <section ref={root} id="theatre" className={s.theatre} style={{ "--accent": piece.accent } as CSSProperties} aria-labelledby="theatre-title">
      <header className={s.head}>
        <p className={s.kicker}>MOTION THEATRE · 1080×1920 · RENDERED WITH REMOTION</p>
        <h2 id="theatre-title" className={s.title}>
          Vertical <em>cuts.</em>
        </h2>
        <p className={s.lede}>The same frame-driven sequences power the website and the MP4 renders — one design system, one clock. Pick a channel.</p>
      </header>

      <div className={s.body}>
        <ol className={s.channels} role="tablist" aria-label="Motion pieces">
          {motionPieces.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                role="tab"
                aria-selected={i === channel}
                className={s.channel}
                style={{ "--accent": p.accent } as CSSProperties}
                onClick={() => tune(i)}
              >
                <span className={s.ch}>CH {String(i + 1).padStart(2, "0")}</span>
                <span className={s.chKicker}>{p.kicker}</span>
                <span className={s.chTitle}>{p.title}</span>
                <span className={s.chMeta}>{`${(p.durationInFrames / p.fps).toFixed(1)}s · ${p.fps}FPS`}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className={s.tv}>
          <div ref={screen} className={s.screen} role="tabpanel" aria-label={piece.title}>
            {near ? <MotionPlayer key={`${piece.id}-${heroId}`} piece={piece} inputProps={takesHero ? { heroId } : {}} /> : <div className={s.loading}>TUNING…</div>}
          </div>
        </div>

        <aside className={s.info}>
          <p className={s.infoKicker}>NOW PLAYING · CH {String(channel + 1).padStart(2, "0")}</p>
          <h3 className={s.infoTitle}>{piece.title}</h3>
          <p className={s.infoBody}>{piece.description}</p>
          {takesHero ? (
            <div className={s.heroPick} role="radiogroup" aria-label="Hero">
              {heroes.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  role="radio"
                  aria-checked={h.id === heroId}
                  className={s.heroChip}
                  style={{ "--chip": h.primaryColor } as CSSProperties}
                  onClick={() => setHeroId(h.id)}
                >
                  {h.name}
                </button>
              ))}
            </div>
          ) : null}
          <dl className={s.specs}>
            <div>
              <dt>COMPOSITION</dt>
              <dd>{piece.id}</dd>
            </div>
            <div>
              <dt>FORMAT</dt>
              <dd>{`${piece.width}×${piece.height} · ${piece.durationInFrames}F`}</dd>
            </div>
          </dl>
          <code className={s.cmd}>{`npx remotion render ${piece.id}${takesHero ? ` --props='{"heroId":"${heroId}"}'` : ""}`}</code>
        </aside>
      </div>
    </section>
  );
}
