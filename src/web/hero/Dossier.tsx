"use client";
/**
 * Hero dossier — an editorial case-file spread: bio, signature move, motion signature
 * (her actual easing curve plotted from the design system), mask anatomy, palette, stats.
 */
import { useMemo, useRef } from "react";
import { color } from "@/design/tokens";
import { ease as easeMap } from "@/design/motion";
import { statLabels, statOrder } from "@/heroes/roster";
import type { Hero } from "@/heroes/types";
import { HeroEmblem, HeroMask } from "@/visual/HeroGraphics";
import { StatHex } from "@/visual/Fx";
import { ease, gsap, sec, useGSAP } from "../motion/gsap";
import { useReducedMotion } from "../hooks/useMedia";
import s from "./Dossier.module.css";

const PLOT_W = 300;
const PLOT_H = 170;

export function Dossier({ hero }: { hero: Hero }) {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mp = hero.motionPersonality;

  const curve = useMemo(() => {
    const fn = easeMap[mp.enter];
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const y = fn(t);
      pts.push(`${(t * PLOT_W).toFixed(1)},${(PLOT_H - 26 - y * (PLOT_H - 56)).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [mp.enter]);

  useGSAP(
    () => {
      if (reduce) return;
      const q = gsap.utils.selector(root);
      gsap.from(q("[data-rv]"), {
        yPercent: 100,
        duration: sec(12),
        ease: ease.glide,
        stagger: sec(2),
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
      gsap.from(q("[data-curve]"), {
        strokeDashoffset: 1,
        duration: sec(30),
        ease: ease.glide,
        scrollTrigger: { trigger: q("[data-curve]")[0], start: "top 85%", once: true },
      });
      gsap.from(q("[data-pop]"), {
        scale: 0.5,
        autoAlpha: 0,
        duration: sec(10),
        ease: ease.overshoot,
        stagger: sec(2),
        scrollTrigger: { trigger: q("[data-side]")[0], start: "top 75%", once: true },
      });
    },
    { scope: root, revertOnUpdate: true, dependencies: [reduce, hero.id] },
  );

  const swatches = [
    ["PRIMARY", hero.primaryColor],
    ["SECONDARY", hero.secondaryColor],
    ["ACCENT", hero.accentColor],
    ["DEEP", hero.deepColor],
  ] as const;

  return (
    <section ref={root} id="dossier" className={s.dossier} aria-labelledby="dossier-title">
      <header className={s.head}>
        <span>FILE Nº{String(hero.index).padStart(2, "0")}</span>
        <span>HERO TRAINING CENTER · RECORD</span>
        <span className={s.stamp}>FAN FICTION</span>
      </header>

      <div className={s.grid}>
        <article className={s.main}>
          <p className={s.mask}>
            <span data-rv className={s.kicker}>
              WHO IS
            </span>
          </p>
          <h2 id="dossier-title" className={s.title}>
            <span className={s.mask}>
              <span data-rv>{hero.heroName.toLowerCase()}?</span>
            </span>
          </h2>
          <p className={s.bio}>{hero.bio}</p>

          <div className={s.block}>
            <p className={s.blockLabel}>SIGNATURE MOVE</p>
            <p className={s.blockTitle}>{hero.powerFX.name}</p>
            <p className={s.blockBody}>{hero.powerFX.description}</p>
          </div>

          <div className={s.block}>
            <p className={s.blockLabel}>MOTION SIGNATURE</p>
            <div className={s.motion}>
              <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className={s.plot} aria-label={`Entrance easing curve: ${mp.enter}`}>
                {[0, 0.25, 0.5, 0.75, 1].map((g) => (
                  <line key={g} x1={g * PLOT_W} x2={g * PLOT_W} y1={10} y2={PLOT_H - 26} stroke={color.ink} strokeOpacity={0.15} />
                ))}
                <line x1={0} x2={PLOT_W} y1={30} y2={30} stroke={hero.primaryColor} strokeDasharray="4 4" />
                <line x1={0} x2={PLOT_W} y1={PLOT_H - 26} y2={PLOT_H - 26} stroke={color.ink} strokeWidth={2} />
                <polyline points={curve} fill="none" stroke={color.ink} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" data-curve />
                <polyline points={curve} fill="none" stroke={hero.primaryColor} strokeWidth={2} strokeLinejoin="round" />
                <text x={0} y={PLOT_H - 6} fontFamily="var(--f-pixel)" fontSize={11} fill={color.ink}>
                  0F
                </text>
                <text x={PLOT_W} y={PLOT_H - 6} textAnchor="end" fontFamily="var(--f-pixel)" fontSize={11} fill={color.ink}>
                  {mp.enterFrames}F
                </text>
                <text x={PLOT_W - 4} y={24} textAnchor="end" fontFamily="var(--f-pixel)" fontSize={11} fill={hero.deepColor}>
                  ARRIVE
                </text>
              </svg>
              <dl className={s.facts}>
                <div>
                  <dt>STYLE</dt>
                  <dd>{mp.kind.toUpperCase()}</dd>
                </div>
                <div>
                  <dt>EASE</dt>
                  <dd>{mp.enter.toUpperCase()}</dd>
                </div>
                <div>
                  <dt>HOLD</dt>
                  <dd>{mp.hold}F</dd>
                </div>
                <div>
                  <dt>ECHOES</dt>
                  <dd>{mp.echoes}</dd>
                </div>
              </dl>
            </div>
            <p className={s.blockBody}>{mp.note}</p>
          </div>
        </article>

        <aside className={s.side} data-side>
          <figure className={s.maskFig} data-pop>
            <svg viewBox="-40 -60 320 220" className={s.maskSvg} aria-label={`${hero.heroName} mask anatomy`}>
              <g>
                <HeroMask hero={hero} asGroup />
              </g>
              {[
                [40, 20, -30, -40, "GLOSS ACRYLIC"],
                [120, 46, 150, -40, "INK KEYLINE"],
                [200, 66, 250, 130, `${hero.primaryColor.toUpperCase()}`],
              ].map(([x, y, lx, ly, t], i) => (
                <g key={i}>
                  <circle cx={x as number} cy={y as number} r={4} fill={color.ink} />
                  <polyline points={`${x},${y} ${lx},${ly}`} fill="none" stroke={color.ink} strokeWidth={1.5} />
                  <text x={lx as number} y={(ly as number) > 100 ? (ly as number) + 18 : (ly as number) - 6} textAnchor={(lx as number) > 120 ? "end" : "start"} fontFamily="var(--f-pixel)" fontSize={12} fill={color.ink}>
                    {t}
                  </text>
                </g>
              ))}
            </svg>
            <figcaption>FIG.1 — MASK</figcaption>
          </figure>

          <figure className={s.emblemFig} data-pop>
            <svg viewBox="-20 -20 140 140" className={s.emblemSvg} aria-label={`${hero.heroName} emblem`}>
              <circle cx={50} cy={50} r={62} fill="none" stroke={color.ink} strokeDasharray="3 5" />
              <line x1={-14} x2={114} y1={50} y2={50} stroke={color.ink} strokeOpacity={0.3} />
              <line y1={-14} y2={114} x1={50} x2={50} stroke={color.ink} strokeOpacity={0.3} />
              <HeroEmblem hero={hero} asGroup />
            </svg>
            <figcaption>FIG.2 — EMBLEM</figcaption>
          </figure>

          <ul className={s.swatches} aria-label="Palette">
            {swatches.map(([label, c]) => (
              <li key={label} data-pop>
                <span className={s.chip} style={{ background: c }} />
                <span className={s.swLabel}>{label}</span>
                <span className={s.swHex}>{c.toUpperCase()}</span>
              </li>
            ))}
          </ul>

          <figure className={s.statFig} data-pop>
            <svg viewBox="0 0 240 240" className={s.hex}>
              <StatHex size={240} values={statOrder.map((k) => hero.stats[k])} labels={statOrder.map((k) => statLabels[k])} fill={hero.primaryColor} fontSize={13} />
            </svg>
            <figcaption>FIG.3 — FIELD STATS</figcaption>
          </figure>
        </aside>
      </div>
    </section>
  );
}
