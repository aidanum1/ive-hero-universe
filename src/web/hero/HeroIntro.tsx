"use client";
/**
 * Hero intro cinematic — plays on arrival:
 * stripe cover sweeps off → roster number slams → name letters collide →
 * portrait enters in her motion personality → SFX pop → dossier lines reveal.
 */
import { useMemo, useRef, useState } from "react";
import { color } from "@/design/tokens";
import { dur } from "@/design/motion";
import type { Hero } from "@/heroes/types";
import { arc } from "@/heroes/shapes";
import { ImpactBurst, RadialSpeedLines, SfxText } from "@/visual/Fx";
import { HeroPortrait } from "@/visual/HeroPortrait";
import { HeroTexture, HalftoneLayer, fields } from "@/visual/Halftone";
import { ease, gsap, sec, useGSAP } from "../motion/gsap";
import { entrance } from "../motion/personalities";
import { exposeTimeline } from "../motion/debug";
import { useReducedMotion } from "../hooks/useMedia";
import { HoldButton } from "../ui/HoldButton";
import { PowerStage } from "../ui/PowerStage";
import { sfx } from "../audio/sfx";
import s from "./HeroIntro.module.css";

const dotField = fields.linear(-60, 0.05, 0.9);

export function HeroIntro({ hero }: { hero: Hero }) {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [power, setPower] = useState<{ run: number } | null>(null);
  const words = useMemo(() => hero.heroName.split(" "), [hero.heroName]);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (reduce) {
        gsap.set(q("[data-cover]"), { autoAlpha: 0 });
        return;
      }
      const tl = gsap.timeline({ delay: 0.05 });
      const play = (id: Parameters<typeof sfx.play>[0], opts?: Parameters<typeof sfx.play>[1]) => () => sfx.play(id, opts);
      tl.call(play("wipe", { volume: 0.7 }), undefined, 0)
        .call(play("wipe", { volume: 0.5, rate: 1.2 }), undefined, sec(2))
        .call(play("wipe", { volume: 0.4, rate: 1.4 }), undefined, sec(4));
      tl.set(q("[data-char]"), { autoAlpha: 0 })
        .set(q("[data-line]"), { yPercent: 105 })
        .set(q("[data-portrait]"), { autoAlpha: 0 })
        .set(q("[data-no]"), { autoAlpha: 0, scale: 2.6 })
        .to(q("[data-cover]"), {
          clipPath: "polygon(140% 0%, 140% 0%, 120% 100%, 120% 100%)",
          duration: sec(10),
          ease: ease.snap,
          // top cover (her colour) sweeps first, revealing secondary, then ink, then the page
          stagger: { each: sec(2), from: "end" },
        })
        .to(q("[data-no]"), { autoAlpha: 1, scale: 1, duration: sec(5), ease: ease.punch }, `-=${sec(6)}`)
        .call(play("impact"), undefined, ">-0.03")
        .call(play("whoosh", { volume: 0.6 }), undefined, ">")
        .set(q("[data-flash]"), { autoAlpha: 1 })
        .set(q("[data-flash]"), { autoAlpha: 0 }, `+=${sec(dur.impact)}`)
        .fromTo(
          q("[data-char]"),
          { autoAlpha: 0, xPercent: (i: number) => (i % 2 ? 160 : -160), rotate: (i: number) => (i % 2 ? 14 : -14) },
          { autoAlpha: 1, xPercent: 0, rotate: 0, duration: sec(9), ease: ease.overshoot, stagger: sec(0.9) },
          "<",
        );
      const portraitTl = gsap.timeline();
      entrance(portraitTl, hero, {
        portrait: q("[data-portrait]")[0],
        echoes: q("[data-echo]"),
        stage: q("[data-stage]")[0],
        accents: {
          gust: q("[data-acc='gust']")[0],
          rings: q("[data-acc='rings']")[0],
          rope: q("[data-acc='rope']")[0],
          glint: q("[data-acc='glint']")[0],
          flash: q("[data-acc='flash']")[0],
        },
      });
      tl.add(portraitTl, `-=${sec(4)}`)
        .call(play(hero.sound.entrance, { volume: 0.8 }), undefined, `<+${sec(Math.max(2, hero.motionPersonality.enterFrames - 4))}`)
        .fromTo(q("[data-sfx]"), { autoAlpha: 1, scale: 0.3, rotate: -20 }, { scale: 1, rotate: -7, duration: sec(6), ease: ease.overshoot }, `-=${sec(2)}`)
        .call(play("pop"), undefined, "<")
        .set(q("[data-sfx]"), { autoAlpha: 0 }, `+=${sec(18)}`)
        .to(q("[data-line]"), { yPercent: 0, duration: sec(10), ease: ease.glide, stagger: sec(2) }, `-=${sec(22)}`);
      exposeTimeline("heroIntro", tl);
    },
    { scope: root, revertOnUpdate: true, dependencies: [reduce, hero.id] },
  );

  return (
    <section ref={root} className={s.intro} aria-labelledby="hero-name">
      <div className={s.bg} aria-hidden>
        <HeroTexture texture={hero.texture} color={hero.deepColor} opacity={0.22} className={s.texture} />
        <HalftoneLayer className={s.dots} width={1200} height={800} cell={22} angle={45} color={hero.deepColor} field={dotField} opacity={hero.texture.kind === "dots" ? 0.18 : 0.4} />
        <svg className={s.lines} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <RadialSpeedLines width={1000} height={1000} cx={700} cy={520} inner={0.26} count={60} color={hero.secondaryColor} seed={`intro-${hero.id}`} />
        </svg>
        <span className={s.glyph}>{hero.glyph}</span>
      </div>

      <div className={s.stage} data-stage>
        <svg className={s.acc} data-acc="gust" viewBox="-500 -500 1000 1000" aria-hidden>
          {[0, 1, 2].map((i) => (
            <path key={i} d={arc(0, i * 120 - 120, 420 - i * 70, 130, 230)} fill="none" stroke={i === 1 ? hero.accentColor : color.paper} strokeWidth={34 - i * 8} strokeLinecap="round" />
          ))}
        </svg>
        <svg className={s.acc} data-acc="rings" viewBox="-500 -500 1000 1000" aria-hidden>
          {[120, 220, 320].map((r, i) => (
            <circle key={r} cx={0} cy={-80} r={r} fill="none" stroke={i === 1 ? color.paper : hero.accentColor} strokeWidth={14} />
          ))}
        </svg>
        <span className={s.rope} data-acc="rope" aria-hidden />
        <span className={s.glint} data-acc="glint" aria-hidden />
        <svg className={s.flash} data-acc="flash" viewBox="-100 -100 200 200" aria-hidden>
          <ImpactBurst cx={0} cy={0} r={90} spikes={8} fill={hero.accentColor} seed="muzzle-intro" strokeWidth={7} />
        </svg>
        <div className={s.figure}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={s.echo} data-echo>
              <HeroPortrait hero={hero} mode="flat" flatColor={i % 2 ? hero.secondaryColor : hero.deepColor} />
            </div>
          ))}
          <div className={s.portrait} data-portrait>
            <HeroPortrait hero={hero} />
          </div>
        </div>
        <svg className={s.sfx} data-sfx viewBox="-300 -160 600 320" aria-hidden>
          <SfxText x={0} y={20} size={150} fill={hero.accentColor} shadow={color.ink}>
            {hero.sfx.ko}
          </SfxText>
          <SfxText x={30} y={120} size={70} fill={color.paper} shadow={null}>
            {hero.sfx.en}
          </SfxText>
        </svg>
      </div>

      <div className={s.copy}>
        <p className={s.no} data-no aria-hidden>
          {String(hero.index).padStart(2, "0")}
        </p>
        <h1 id="hero-name" className={s.name} aria-label={hero.heroName}>
          {words.map((w, wi) => (
            <span key={wi} className={s.word} aria-hidden>
              {[...w].map((c, i) => (
                <span key={i} data-char>
                  {c}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <div className={s.info}>
          <p className={s.mask}>
            <span data-line className={s.real}>
              {hero.name} · <span lang="ko">{hero.nameKo}</span> · <span lang="ko">{hero.heroNameKo}</span>
            </span>
          </p>
          <p className={s.mask}>
            <span data-line className={s.cls}>
              {hero.heroClass}
            </span>
          </p>
          <p className={s.mask}>
            <span data-line className={s.tagline}>
              {hero.tagline}
            </span>
          </p>
          <div className={s.actions}>
            <HoldButton accent={hero.accentColor} onFire={() => setPower({ run: Date.now() })} disabled={!!power} label="HOLD FOR POWER" />
            <a href="#dossier" className={s.down}>
              DOSSIER ▼
            </a>
          </div>
        </div>
      </div>

      {power ? <PowerStage heroId={hero.id} runId={power.run} onDone={() => setPower(null)} /> : null}

      <span className={s.flashFrame} data-flash aria-hidden />
      <div className={s.covers} aria-hidden>
        <span data-cover style={{ background: color.ink }} />
        <span data-cover style={{ background: hero.secondaryColor }} />
        <span data-cover style={{ background: hero.primaryColor }} />
      </div>
    </section>
  );
}
