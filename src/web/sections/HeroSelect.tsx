"use client";
/**
 * HERO SELECT — a PS2-era character-select built from the shared hero data.
 * Mouse hover / click, keyboard arrows, touch swipe on the showcase, roster taps.
 * Each switch: comic-panel colour wipe → cursor jump → the incoming hero's own entrance
 * personality → name collision → SFX pop. HOLD TO CHARGE plays her power sequence.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { heroThemeVars } from "@/design/cssVars";
import { color } from "@/design/tokens";
import { dur } from "@/design/motion";
import { heroes, statLabels, statOrder } from "@/heroes/roster";
import { HalftoneWipe, RadialSpeedLines, SfxText, StatHex, ImpactBurst } from "@/visual/Fx";
import { HeroEmblem } from "@/visual/HeroGraphics";
import { HeroPortrait } from "@/visual/HeroPortrait";
import { HalftoneLayer, HeroTexture, fields } from "@/visual/Halftone";
import { arc } from "@/heroes/shapes";
import { ease, gsap, sec, useGSAP } from "../motion/gsap";
import { entrance } from "../motion/personalities";
import { useReducedMotion } from "../hooks/useMedia";
import { HoldButton } from "../ui/HoldButton";
import { sfx } from "../audio/sfx";
import { semis } from "@/audio/cues";
import { withBase } from "@/lib/basePath";
import { PowerStage } from "../ui/PowerStage";
import s from "./HeroSelect.module.css";

const burstField = fields.radial(0.5, 0.5, 0.95, 0.05, 0.62);

export function HeroSelect() {
  const root = useRef<HTMLElement>(null);
  const router = useRouter();
  const reduce = useReducedMotion();
  const [{ index, prev }, setSel] = useState({ index: 0, prev: 0 });
  const [power, setPower] = useState<{ run: number } | null>(null);
  /** 0..1 halftone cover played on ENTER before routing to the hero page. */
  const [cover, setCover] = useState(0);
  const hero = heroes[index];
  const previous = heroes[prev];

  const select = useCallback((next: number) => {
    setSel((cur) => {
      const n = (next + heroes.length) % heroes.length;
      return n === cur.index ? cur : { index: n, prev: cur.index };
    });
  }, []);

  // ───────── switch choreography ─────────
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const tiles = q("[data-tile]");
      const tile = tiles[index] as HTMLElement | undefined;
      const cursor = q("[data-cursor]")[0] as HTMLElement | undefined;
      if (tile && cursor) {
        const x = tile.offsetLeft + tile.offsetWidth / 2 - cursor.offsetWidth / 2;
        if (reduce || prev === index) gsap.set(cursor, { x });
        else gsap.to(cursor, { x, duration: sec(dur.snap + 1), ease: ease.overshootSoft });
      }
      if (reduce || prev === index) return;

      const dir: 1 | -1 = index > prev ? 1 : -1;
      const tl = gsap.timeline();
      // sound: her note on the cursor, a whoosh for the wipe, her entrance, then the SFX pop
      sfx.play("cursor", { rate: semis(hero.sound.note) });
      tl.call(() => sfx.play("whoosh", { volume: 0.45, pan: dir * 0.3 }), undefined, sec(1))
        .call(() => sfx.play(hero.sound.entrance, { volume: 0.75 }), undefined, sec(Math.max(2, hero.motionPersonality.enterFrames - 4)))
        .call(() => sfx.play("pop", { volume: 0.6 }), undefined, sec(hero.motionPersonality.enterFrames));
      // 1. comic-panel colour wipe (diagonal edge)
      tl.fromTo(
        q("[data-wipe]"),
        { clipPath: dir > 0 ? "polygon(0% 0%, 0% 0%, -20% 100%, -20% 100%)" : "polygon(120% 0%, 120% 0%, 100% 100%, 100% 100%)" },
        { clipPath: "polygon(0% 0%, 120% 0%, 100% 100%, -20% 100%)", duration: sec(9), ease: ease.snap },
        0,
      );
      // 2. personality entrance
      const showcase = q("[data-showcase]")[0];
      entrance(
        tl,
        hero,
        {
          portrait: q("[data-portrait]")[0],
          echoes: q("[data-echo]"),
          stage: showcase,
          accents: {
            gust: q("[data-acc='gust']")[0],
            rings: q("[data-acc='rings']")[0],
            rope: q("[data-acc='rope']")[0],
            glint: q("[data-acc='glint']")[0],
            flash: q("[data-acc='flash']")[0],
          },
        },
        dir,
      );
      // 3. name collision + panel reveals
      tl.fromTo(
        q("[data-char]"),
        { yPercent: (i: number) => (i % 2 ? 110 : -110), autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: sec(8), ease: ease.overshoot, stagger: sec(0.8) },
        sec(2),
      )
        .fromTo(q("[data-line]"), { yPercent: 105 }, { yPercent: 0, duration: sec(9), ease: ease.glide, stagger: sec(1.5) }, sec(4))
        .fromTo(q("[data-statbar]"), { scaleX: 0 }, { scaleX: 1, duration: sec(12), ease: ease.overshootSoft, stagger: sec(1) }, sec(6))
        .fromTo(q("[data-hex]"), { scale: 0.3, rotate: -40 }, { scale: 1, rotate: 0, duration: sec(12), ease: ease.overshoot }, sec(5));
      // 4. SFX pop, hard cut out
      tl.fromTo(q("[data-sfx]"), { scale: 0.3, autoAlpha: 1, rotate: -18 }, { scale: 1, rotate: -6, duration: sec(6), ease: ease.overshoot }, sec(hero.motionPersonality.enterFrames))
        .set(q("[data-sfx]"), { autoAlpha: 0 }, `>+${sec(14)}`);
    },
    { scope: root, dependencies: [index, reduce] },
  );

  // ───────── charge feedback on the stage ─────────
  const onCharge = useCallback((p: number) => {
    root.current?.style.setProperty("--charge", p.toFixed(3));
  }, []);

  const confirm = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const href = `/heroes/${hero.id}`;
      if (reduce) return router.push(href);
      const q = gsap.utils.selector(root);
      const wipe = { p: 0 };
      router.prefetch(href);
      gsap
        .timeline({ onComplete: () => router.push(href) })
        .call(() => {
          sfx.play("confirm");
          sfx.play("impact");
        })
        .set(q("[data-flash]"), { autoAlpha: 1 })
        .set(q("[data-flash]"), { autoAlpha: 0 }, `+=${sec(dur.impact)}`)
        .fromTo(q("[data-confirm]"), { autoAlpha: 1, scale: 2.2, rotate: -20 }, { scale: 1, rotate: -8, duration: sec(6), ease: ease.punch })
        .call(() => sfx.play("stamp"), undefined, `<+${sec(3)}`)
        .call(() => sfx.play("wipe", { volume: 0.8 }), undefined, `>+${sec(dur.hold)}`)
        // halftone reveal: dots in her colour grow until they merge — the hero page opens on the same colour
        .to(wipe, { p: 1, duration: sec(12), ease: "none", onUpdate: () => setCover(wipe.p) }, `+=${sec(dur.hold)}`);
    },
    [hero.id, reduce, router],
  );

  // ───────── swipe ─────────
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => (swipe.current = { x: e.clientX, y: e.clientY });
  const onPointerUp = (e: React.PointerEvent) => {
    if (!swipe.current) return;
    const dx = e.clientX - swipe.current.x;
    const dy = e.clientY - swipe.current.y;
    swipe.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) select(index + (dx < 0 ? 1 : -1));
  };

  const onRosterKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      select(index + 1);
      (root.current?.querySelectorAll<HTMLElement>("[data-tile]")[(index + 1) % 6])?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      select(index - 1);
      (root.current?.querySelectorAll<HTMLElement>("[data-tile]")[(index + 5) % 6])?.focus();
    }
  };

  const words = useMemo(() => hero.heroName.split(" "), [hero.heroName]);

  return (
    <section ref={root} id="select" className={s.select} style={heroThemeVars(hero)} aria-label="Hero select">
      {/* ───── background ───── */}
      <div className={s.bg} aria-hidden>
        <div className={s.bgBase} style={{ background: previous.secondaryColor }} />
        <div className={s.bgWipe} data-wipe style={{ background: hero.secondaryColor }} />
        <HeroTexture texture={hero.texture} color={hero.primaryColor} opacity={0.22} className={s.texture} />
        <div className={s.ghost}>
          <span>{hero.heroName}</span>
          <span>{hero.heroName}</span>
        </div>
        <svg className={s.chargeLines} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <RadialSpeedLines width={1000} height={1000} cx={330} cy={480} inner={0.22} count={64} color={hero.primaryColor} seed="charge" />
        </svg>
      </div>

      {/* ───── HUD ───── */}
      <header className={s.hud}>
        <div className={s.hudLeft}>
          <span className={s.hudTag}>1P</span>
          <h2 className={s.hudTitle}>SELECT YOUR HERO</h2>
        </div>
        <p className={s.hudRight}>
          <span className={s.hudCount}>
            {String(hero.index).padStart(2, "0")}
            <small>/06</small>
          </span>
          <span className={s.hudHint}>← → · SWIPE · TAP</span>
        </p>
      </header>

      {/* ───── stage ───── */}
      <div className={s.stage}>
        <div className={s.showcase} data-showcase onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
          <svg className={s.burst} viewBox="-500 -500 1000 1000" aria-hidden>
            <ImpactBurst cx={0} cy={0} r={470} spikes={22} fill={hero.primaryColor} stroke={color.ink} strokeWidth={8} seed={`sel-${hero.id}`} inner={0.84} />
          </svg>
          <HalftoneLayer className={s.burstDots} width={600} height={600} cell={16} angle={30} color={hero.deepColor} field={burstField} opacity={0.5} />
          <HeroEmblem hero={hero} className={s.emblem} width="44%" flat={hero.deepColor} />
          <span className={s.glyph} aria-hidden>
            {hero.glyph}
          </span>

          {/* accessories for personalities */}
          <svg className={s.acc} data-acc="gust" viewBox="-500 -500 1000 1000" aria-hidden>
            {[0, 1, 2].map((i) => (
              <path key={i} d={arc(0, i * 120 - 120, 420 - i * 70, 130, 230)} fill="none" stroke={i === 1 ? hero.accentColor : color.paper} strokeWidth={34 - i * 8} strokeLinecap="round" />
            ))}
          </svg>
          <svg className={s.acc} data-acc="rings" viewBox="-500 -500 1000 1000" aria-hidden>
            {[120, 220, 320].map((r, i) => (
              <circle key={r} cx={0} cy={-60} r={r} fill="none" stroke={i === 1 ? color.paper : hero.accentColor} strokeWidth={14} />
            ))}
            <path d="M -420 -60 H 420 M 0 -480 V 360" stroke={color.paper} strokeWidth={4} />
          </svg>
          <span className={s.rope} data-acc="rope" aria-hidden />
          <span className={s.glint} data-acc="glint" aria-hidden />
          <svg className={s.flash} data-acc="flash" viewBox="-100 -100 200 200" aria-hidden>
            <ImpactBurst cx={0} cy={0} r={90} spikes={8} fill={hero.accentColor} seed="muzzle" strokeWidth={7} />
          </svg>

          <div className={s.figure}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={s.echo} data-echo>
                <HeroPortrait hero={hero} mode="flat" flatColor={i % 2 ? hero.secondaryColor : hero.primaryColor} />
              </div>
            ))}
            <div className={s.portrait} data-portrait>
              <HeroPortrait hero={hero} />
            </div>
          </div>

          <svg className={s.sfx} data-sfx viewBox="-300 -160 600 320" aria-hidden>
            <SfxText x={0} y={20} size={150} fill={hero.accentColor} shadow={hero.primaryColor}>
              {hero.sfx.ko}
            </SfxText>
            <SfxText x={30} y={120} size={70} fill={color.paper} shadow={null}>
              {hero.sfx.en}
            </SfxText>
          </svg>

          <svg className={s.confirm} data-confirm viewBox="-260 -90 520 180" aria-hidden>
            <rect x={-250} y={-80} width={500} height={160} fill={color.paper} stroke={color.signal} strokeWidth={10} />
            <text x={0} y={-10} textAnchor="middle" fontFamily="var(--f-display)" fontSize={64} fill={color.signal}>
              HERO
            </text>
            <text x={0} y={56} textAnchor="middle" fontFamily="var(--f-display)" fontSize={56} fill={color.signal}>
              CONFIRMED
            </text>
          </svg>
          <span className={s.flashFrame} data-flash aria-hidden />
        </div>

        {/* ───── info panel ───── */}
        <aside className={s.panel} aria-live="polite">
          <p className={s.mask}>
            <span data-line className={s.cls}>
              {hero.heroClass}
            </span>
          </p>
          <h3 className={s.name} aria-label={hero.heroName}>
            {words.map((w, wi) => (
              <span key={`${hero.id}-${wi}`} className={s.word} aria-hidden>
                {[...w].map((c, i) => (
                  <span key={i} data-char>
                    {c}
                  </span>
                ))}
              </span>
            ))}
          </h3>
          <p className={s.mask}>
            <span data-line className={s.real}>
              {hero.name} <i>·</i> <span lang="ko">{hero.nameKo}</span> <i>·</i> <span lang="ko">{hero.heroNameKo}</span>
            </span>
          </p>
          <p className={`${s.mask} ${s.taglineWrap}`}>
            <span data-line className={s.tagline}>
              {hero.tagline}
            </span>
          </p>

          <div className={s.stats}>
            <svg className={s.hex} data-hex viewBox="0 0 200 200" aria-hidden>
              <StatHex
                size={200}
                values={statOrder.map((k) => hero.stats[k])}
                labels={statOrder.map((k) => statLabels[k])}
                fill={hero.primaryColor}
                stroke={color.paper}
                grid="rgba(242,237,227,.25)"
                labelColor={color.paper}
                fontSize={13}
              />
            </svg>
            <dl className={s.bars}>
              {statOrder.map((k) => (
                <div key={k} className={s.barRow}>
                  <dt>{statLabels[k]}</dt>
                  <dd>
                    <span className={s.barTrack}>
                      <span data-statbar className={s.barFill} style={{ width: `${hero.stats[k] * 10}%` }} />
                    </span>
                    <b>{hero.stats[k]}</b>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={s.power}>
            <p className={s.powerKicker}>SIGNATURE MOVE</p>
            <p className={s.powerName}>{hero.powerFX.name}</p>
            <p className={s.powerDesc}>{hero.powerFX.description}</p>
          </div>

          <div className={s.actions}>
            <HoldButton accent={hero.primaryColor} onCharge={onCharge} onFire={() => setPower({ run: Date.now() })} disabled={!!power} />
            <a href={withBase(`/heroes/${hero.id}/`)} className={s.enter} onClick={confirm}>
              <span>ENTER</span>
              <span aria-hidden>▶</span>
            </a>
          </div>
        </aside>
      </div>

      {power ? <PowerStage heroId={hero.id} runId={power.run} onDone={() => setPower(null)} /> : null}
      {cover > 0 ? (
        <svg className={s.halftoneCover} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <HalftoneWipe width={1600} height={1000} progress={cover} cell={70} color={hero.primaryColor} angle={-25} />
        </svg>
      ) : null}

      {/* ───── roster ───── */}
      <div className={s.rosterWrap}>
        <div className={s.roster} role="radiogroup" aria-label="Heroes" onKeyDown={onRosterKey}>
          {heroes.map((h, i) => (
            <button
              key={h.id}
              type="button"
              role="radio"
              aria-checked={i === index}
              aria-label={`${h.heroName} — ${h.name}`}
              tabIndex={i === index ? 0 : -1}
              data-tile
              className={s.tile}
              style={heroThemeVars(h)}
              onPointerEnter={(e) => e.pointerType === "mouse" && select(i)}
              onFocus={() => select(i)}
              onClick={() => {
                sfx.play("select", { rate: semis(h.sound.note) });
                select(i);
              }}
            >
              <span className={s.tileInner}>
                <HeroPortrait hero={h} className={s.tilePortrait} showEmblem={false} />
                <span className={s.tileNo}>{String(h.index).padStart(2, "0")}</span>
                <span className={s.tileName}>{h.name}</span>
              </span>
            </button>
          ))}
          <span className={s.cursor} data-cursor aria-hidden>
            <span className={s.cursorTag}>1P</span>
          </span>
        </div>
      </div>
    </section>
  );
}
