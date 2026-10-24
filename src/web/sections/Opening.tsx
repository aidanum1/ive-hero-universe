"use client";
/**
 * OPENING — a title sequence instead of a hero section.
 * boot screen → six hero bars slam → diagonal panel wipe → I·V·E impact slams →
 * HERO / UNIVERSE collision → tagline + print furniture → PRESS START.
 */
import { useCallback, useRef, useState } from "react";
import { dur, sec } from "@/design/motion";
import { color } from "@/design/tokens";
import { heroes } from "@/heroes/roster";
import { release } from "@/content/release";
import { owner } from "@/content/project";
import { Barcode, ImpactBurst, RadialSpeedLines, RegistrationMark } from "@/visual/Fx";
import { Monogram } from "@/visual/Monogram";
import { HeroEmblem } from "@/visual/HeroGraphics";
import { ease, gsap, useGSAP } from "../motion/gsap";
import { useReducedMotion } from "../hooks/useMedia";
import { exposeTimeline } from "../motion/debug";
import { sfx } from "../audio/sfx";
import { semis } from "@/audio/cues";
import s from "./Opening.module.css";

const BOOT_LINES = ["HERO UNIVERSE SYSTEM  VER 5.0", "© FAN-MADE · NOT AFFILIATED", "LOADING HEROES"];

export function Opening({ onStart }: { onStart?: () => void }) {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const timeline = useRef<gsap.core.Timeline | null>(null);
  /** PRESS START gate — browsers only allow audio after a gesture, so the boot screen asks. */
  const [gate, setGate] = useState(false);

  const begin = useCallback((withSound: boolean) => {
    sfx.setEnabled(withSound);
    if (withSound) sfx.unlock();
    setGate(false);
    sfx.play("boot");
    timeline.current?.play();
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (reduce) {
        gsap.set(q("[data-boot]"), { autoAlpha: 0 });
        gsap.set(q("[data-bar]"), { autoAlpha: 0 });
        q("[data-start]").forEach((el) => el.setAttribute("data-live", "true"));
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: ease.punch } });
      timeline.current = tl;
      const play = (id: Parameters<typeof sfx.play>[0], opts?: Parameters<typeof sfx.play>[1]) => () => sfx.play(id, opts);
      // Sound cues are collected at absolute times and added after the visual timeline is
      // built, so they never shift GSAP's relative ("<" / ">") positioning.
      const cues: [number, () => void][] = [];
      const cueAt = (fn: () => void, offset = 0) => cues.push([(tl.recent() as gsap.core.Animation).startTime() + offset, fn]);
      const impact = (at: number | string) =>
        tl.set(q("[data-flash]"), { autoAlpha: 1 }, at).set(q("[data-flash]"), { autoAlpha: 0 }, `>${sec(dur.impact)}`);
      const shakeTitle = (at: number | string, k = 1) =>
        tl.fromTo(
          q("[data-title]"),
          { x: 14 * k, y: -8 * k },
          { x: 0, y: 0, duration: sec(9), ease: ease.bounce },
          at,
        );

      // 1 — boot screen: typed lines + six-step loading bar.
      tl.set(q("[data-page]"), { autoAlpha: 0 })
        .set(q("[data-bar]"), { yPercent: -101 })
        .set(q("[data-letter]"), { autoAlpha: 0, scale: 2.6, yPercent: -12 })
        .set(q("[data-word]"), { autoAlpha: 0 })
        .set(q("[data-band]"), { scaleX: 0 })
        .set(q("[data-lines]"), { autoAlpha: 0, scale: 0.6 })
        .set(q("[data-reveal]"), { yPercent: 105 })
        .set(q("[data-pop]"), { autoAlpha: 0, scale: 0.4 })
        .set(q("[data-spark]"), { autoAlpha: 0 })
        .set(q("[data-boot-line], [data-boot-seg]"), { autoAlpha: 0 });
      q("[data-boot-line]").forEach((el, i) => tl.set(el, { autoAlpha: 1 }, i ? `+=${sec(4)}` : sec(2)).call(play("type", { rate: 1 + i * 0.12 }), undefined, "<"));
      q("[data-boot-seg]").forEach((el, i) => tl.set(el, { autoAlpha: 1 }, `+=${sec(2)}`).call(play("cursor", { rate: semis(heroes[i].sound.note) }), undefined, "<"));
      // Gate: hold on PRESS START until the viewer chooses sound on/off (skipped once audio is live).
      tl.call(() => {
        if (!sfx.ready) {
          tl.pause();
          setGate(true);
        }
      })
        .to({}, { duration: sec(6) })
        // 2 — hard cut: bars slam.
        .set(q("[data-boot]"), { autoAlpha: 0 })
        .addLabel("bars")
        .to(q("[data-bar]"), { yPercent: 0, duration: sec(6), stagger: sec(dur.stagger) })
        .from(q("[data-bar-name]"), { yPercent: 60, autoAlpha: 0, duration: sec(6), stagger: sec(dur.stagger) }, "<")
        .to({}, { duration: sec(dur.hold) })
        // 3 — diagonal panel wipe reveals the printed page.
        .set(q("[data-page]"), { autoAlpha: 1 })
        .to(q("[data-bar]"), {
          clipPath: (i: number) => (i % 2 ? "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" : "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"),
          duration: sec(9),
          ease: ease.snap,
          stagger: sec(1.5),
        });
      cueAt(play("wipe"));
      heroes.forEach((h, i) => cues.push([tl.labels.bars + sec(i * dur.stagger + 3), play("barSlam", { rate: semis(h.sound.note), volume: 0.7 })]));

      // 4 — I · V · E slams, each with an impact frame.
      const letters = q("[data-letter]");
      letters.forEach((el, i) => {
        const at = `>${i === 0 ? -sec(2) : sec(1)}`;
        tl.to(el, { autoAlpha: 1, scale: 1, yPercent: 0, duration: sec(5), ease: ease.punch }, at);
        cueAt(play(i === 0 ? "bigImpact" : "impact", { rate: [1, 1.12, 1.26][i] }), sec(5) - 0.03);
        impact(">");
        shakeTitle("<", 1 - i * 0.2);
        if (i === 0) tl.to(q("[data-lines]"), { autoAlpha: 1, scale: 1, duration: sec(8), ease: ease.punch }, "<");
      });
      tl.to(q("[data-lines]"), { autoAlpha: 0.32, duration: sec(18), ease: ease.glide }, ">");

      // 5 — HERO / UNIVERSE collision on an ink band.
      tl.to(q("[data-band]"), { scaleX: 1, duration: sec(7), ease: ease.snap }, `<${-sec(16)}`)
        .fromTo(q("[data-word='hero']"), { autoAlpha: 1, xPercent: -160 }, { xPercent: 0, duration: sec(8), ease: ease.overshoot }, "<+0.12")
        .fromTo(q("[data-word='universe']"), { autoAlpha: 1, xPercent: 120 }, { xPercent: 0, duration: sec(8), ease: ease.overshoot }, "<");
      cueAt(play("whoosh", { rate: 1.3, volume: 0.6 }));
      cueAt(play("collide"), sec(4));
      tl
        .set(q("[data-spark]"), { autoAlpha: 1 }, `<+${sec(5)}`)
        .set(q("[data-spark]"), { autoAlpha: 0 }, `>+${sec(3)}`);
      shakeTitle(`<-${sec(3)}`, 0.5);

      // 6 — tagline + print furniture.
      tl.to(q("[data-reveal]"), { yPercent: 0, duration: sec(10), ease: ease.glide, stagger: sec(3) }, ">-0.05")
        .to(q("[data-pop]"), { autoAlpha: 1, scale: 1, duration: sec(8), ease: ease.overshoot, stagger: sec(2) }, "<+0.1");
      cueAt(play("pop", { volume: 0.5 }));
      cueAt(play("pop", { volume: 0.4, rate: 1.2 }), sec(4));
      cueAt(play("stamp", { volume: 0.6 }), sec(5));
      tl
        .add(() => q("[data-start]").forEach((el) => el.setAttribute("data-live", "true")));

      for (const [t, fn] of cues) tl.call(fn, undefined, t);
      exposeTimeline("opening", tl);

      // Any input during the sequence skips to the composed end frame (silently).
      const skip = (e: Event) => {
        if ((e.target as Element | null)?.closest?.("[data-gate]")) return;
        if (tl.progress() < 1) {
          setGate(false);
          tl.progress(1, true);
        }
      };
      const opts = { passive: true } as const;
      window.addEventListener("wheel", skip, opts);
      window.addEventListener("touchstart", skip, opts);
      window.addEventListener("keydown", skip);

      // Exit: camera push as the page scrolls away.
      gsap.to(q("[data-camera]"), {
        yPercent: -18,
        scale: 1.12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      return () => {
        window.removeEventListener("wheel", skip);
        window.removeEventListener("touchstart", skip);
        window.removeEventListener("keydown", skip);
      };
    },
    { scope: root, revertOnUpdate: true, dependencies: [reduce] },
  );

  return (
    <section ref={root} className={s.opening} id="opening" aria-label="IVE Hero Universe — title sequence">
      {/* Printed page revealed by the wipe */}
      <div className={s.page} data-page>
        <Monogram className={s.monogram} tile={150} tint={color.lilac} />
        <div className={s.dots} />
      </div>

      <div className={s.camera} data-camera>
        <svg className={s.lines} data-lines viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <RadialSpeedLines width={1000} height={1000} cx={500} cy={470} inner={0.2} count={72} color={color.ink} seed="opening" thickness={1.4} />
        </svg>

        <h1 className={s.title} data-title>
          <span className={s.ive} aria-label="IVE">
            {["I", "V", "E"].map((l) => (
              <span key={l} className={s.letter} data-letter aria-hidden>
                {l}
              </span>
            ))}
          </span>
          <span className={s.band} data-band aria-hidden />
          <span className={s.words}>
            <span className={s.word} data-word="hero">HERO</span>{" "}
            <span className={s.word} data-word="universe">UNIVERSE</span>
          </span>
          <svg className={s.spark} data-spark viewBox="-100 -100 200 200" aria-hidden>
            <ImpactBurst cx={0} cy={0} r={90} spikes={11} fill={color.plateYellow} seed="collide" strokeWidth={8} />
          </svg>
        </h1>

        <div className={s.tagline}>
          <p className={s.mask}>
            <span data-reveal className={s.voice}>Six heroes. One universe.</span>
          </p>
          <p className={s.mask}>
            <span data-reveal className={s.voice}>
              <em>Looks</em> can kill.
            </span>
          </p>
          <p className={s.mask}>
            <span data-reveal className={s.kicker}>
              THE GIRL HERO ERA — A FAN PROJECT BY{" "}
              <a href={owner.url} target="_blank" rel="noopener noreferrer" className={s.owner}>
                {owner.handle.toUpperCase()}
              </a>
            </span>
          </p>
        </div>
      </div>

      {/* Print furniture */}
      <div className={s.issue} data-pop>
        <span className={s.issueNo}>
          N<sup>o</sup>05
        </span>
        <span className={s.issueText}>
          {release.title}
          <br />
          ISSUE · {release.concept}
        </span>
      </div>
      <div className={s.barcode} data-pop aria-hidden>
        <svg viewBox="0 0 160 70">
          <rect width="160" height="70" fill={color.paper} />
          <Barcode x={8} y={8} width={144} height={40} value="IVE-HERO-UNIVERSE-05" />
          <text x={80} y={64} textAnchor="middle" fontSize="11" fontFamily="var(--f-pixel)" fill={color.ink}>
            FAN EDITION · ₩0
          </text>
        </svg>
      </div>
      <div className={s.stamp} data-pop aria-hidden>
        <span>UNOFFICIAL</span>
        <strong>FAN-MADE</strong>
        <span>PROJECT</span>
      </div>
      <div className={s.colorbar} data-pop aria-hidden>
        {heroes.map((h) => (
          <span key={h.id} style={{ background: h.primaryColor }} />
        ))}
        <span style={{ background: color.plateCyan }} />
        <span style={{ background: color.plateMagenta }} />
        <span style={{ background: color.plateYellow }} />
        <span style={{ background: color.ink }} />
      </div>
      <svg className={s.reg} aria-hidden>
        <RegistrationMark x={22} y={22} r={12} />
      </svg>
      <svg className={`${s.reg} ${s.regR}`} aria-hidden>
        <RegistrationMark x={22} y={22} r={12} />
      </svg>

      <button
        className={s.start}
        data-start
        onClick={() => {
          sfx.play("confirm");
          onStart?.();
        }}
        type="button"
      >
        <span className={s.startBlink}>PRESS START</span>
        <span className={s.startHint}>SELECT YOUR HERO ▼</span>
      </button>

      {/* Boot screen (first ~1s) */}
      <div className={s.boot} data-boot>
        <div className={s.bootText}>
          {BOOT_LINES.map((l) => (
            <p key={l} data-boot-line>
              {l}
            </p>
          ))}
        </div>
        <div className={s.bootBar}>
          {heroes.map((h) => (
            <span key={h.id} data-boot-seg style={{ background: h.primaryColor }} aria-hidden>
              <i>{h.name}</i>
            </span>
          ))}
        </div>
        {gate ? (
          <div className={s.gate} data-gate role="dialog" aria-label="Start with sound?">
            <p className={s.gateTitle}>
              <span className={s.gateBlink}>▶</span> PRESS START
            </p>
            <div className={s.gateButtons}>
              <button type="button" className={s.gateOn} onClick={() => begin(true)} autoFocus>
                SOUND ON
              </button>
              <button type="button" className={s.gateOff} onClick={() => begin(false)}>
                SOUND OFF
              </button>
            </div>
            <p className={s.gateHint}>EVERY SOUND IS SYNTHESISED LIVE · TOGGLE ANYTIME IN THE NAV</p>
          </div>
        ) : null}
      </div>

      {/* Six hero bars */}
      <div className={s.bars} aria-hidden>
        {heroes.map((h) => (
          <div key={h.id} className={s.bar} data-bar style={{ background: h.primaryColor, color: h.onPrimary }}>
            <span className={s.barName} data-bar-name>
              {h.heroName}
            </span>
            <HeroEmblem hero={h} width="38%" className={s.barEmblem} />
          </div>
        ))}
      </div>

      <div className={s.flash} data-flash aria-hidden />
    </section>
  );
}
