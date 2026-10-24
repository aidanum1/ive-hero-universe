"use client";
/**
 * EP RELEASE — live countdown to "Looks Can Kill" (26.10.2026 18:00 KST) with a
 * stage-select tracklist. Switches to an OUT NOW state automatically after release.
 */
import { useRef, useSyncExternalStore } from "react";
import { release, releaseState, timeLeft } from "@/content/release";
import { heroes } from "@/heroes/roster";
import { color } from "@/design/tokens";
import { ImpactBurst } from "@/visual/Fx";
import { ease, gsap, sec, useGSAP } from "../motion/gsap";
import { useReducedMotion } from "../hooks/useMedia";
import s from "./Release.module.css";

function subscribeClock(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}
const getNow = () => Math.floor(Date.now() / 1000);
/** Seconds clock; null on the server so markup never mismatches. */
function useNowSeconds() {
  return useSyncExternalStore(subscribeClock, getNow, () => null);
}

const pad = (n: number) => String(n).padStart(2, "0");

function Digits({ value, label }: { value: string; label: string }) {
  return (
    <div className={s.unit}>
      <div className={s.digits}>
        {[...value].map((d, i) => (
          <span key={i} className={s.digit}>
            {d}
          </span>
        ))}
      </div>
      <span className={s.unitLabel}>{label}</span>
    </div>
  );
}

export function Release() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const now = useNowSeconds();
  const state = now === null ? "countdown" : releaseState(now * 1000);
  const left = timeLeft(now === null ? Date.parse(release.releaseAt) - 1 : now * 1000);
  // Viewer's local time for the drop (client only — `now` is null during SSR).
  const kst =
    now === null
      ? ""
      : new Date(release.releaseAt).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  useGSAP(
    () => {
      if (reduce) return;
      const q = gsap.utils.selector(root);
      gsap.from(q("[data-track]"), {
        xPercent: -12,
        autoAlpha: 0,
        duration: sec(10),
        ease: ease.overshootSoft,
        stagger: sec(2),
        scrollTrigger: { trigger: q("[data-tracks]")[0], start: "top 80%", once: true },
      });
      gsap.from(q("[data-unit]"), {
        yPercent: 40,
        autoAlpha: 0,
        duration: sec(9),
        ease: ease.punch,
        stagger: sec(2),
        scrollTrigger: { trigger: root.current, start: "top 65%", once: true },
      });
    },
    { scope: root, revertOnUpdate: true, dependencies: [reduce] },
  );

  return (
    <section ref={root} id="release" className={s.release} data-state={state} aria-labelledby="release-title">
      <div className={s.bars} aria-hidden>
        {heroes.map((h) => (
          <span key={h.id} style={{ background: h.primaryColor }} />
        ))}
      </div>

      <div className={s.grid}>
        <div className={s.left}>
          <p className={s.kicker}>
            {release.artist} · {release.format} · {release.concept}
          </p>
          <h2 id="release-title" className={s.title}>
            <span>LOOKS</span>
            <span>CAN</span>
            <span className={s.kill}>KILL</span>
          </h2>

          {state === "countdown" ? (
            <div className={s.countdown} role="timer" aria-live="off" aria-label={`Time until release: ${left.days} days ${left.hours} hours ${left.minutes} minutes`}>
              <p className={s.cdLabel}>
                <span className={s.rec}>●</span> TIME UNTIL RELEASE
              </p>
              <div className={s.units}>
                <div data-unit>
                  <Digits value={now === null ? "--" : pad(left.days)} label="DAYS" />
                </div>
                <div data-unit>
                  <Digits value={now === null ? "--" : pad(left.hours)} label="HRS" />
                </div>
                <div data-unit>
                  <Digits value={now === null ? "--" : pad(left.minutes)} label="MIN" />
                </div>
                <div data-unit>
                  <Digits value={now === null ? "--" : pad(left.seconds)} label="SEC" />
                </div>
              </div>
              <p className={s.when}>
                26.10.2026 · 18:00 KST {kst ? <span>· your time: {kst}</span> : null}
              </p>
            </div>
          ) : (
            <div className={s.out}>
              <svg viewBox="-160 -160 320 320" className={s.outBurst} aria-hidden>
                <ImpactBurst cx={0} cy={0} r={150} spikes={18} fill={color.plateYellow} seed="out-now" />
              </svg>
              <p className={s.outText}>OUT NOW</p>
              <p className={s.when}>Released 26.10.2026 · 18:00 KST — go stream it on your platform of choice.</p>
            </div>
          )}
          <p className={s.pre}>
            <b>PRE-RELEASE</b> Title track “Looks Can Kill” + MV — out since 19.10
          </p>
        </div>

        <div className={s.right}>
          <p className={s.stageLabel}>STAGE SELECT · {release.tracks.length} TRACKS</p>
          <ol className={s.tracks} data-tracks>
            {release.tracks.map((t, i) => {
              const h = heroes[i % heroes.length];
              const isTitle = t.no === 1;
              return (
                <li key={t.no} className={s.track} data-track data-title={isTitle} style={{ "--c": h.primaryColor } as React.CSSProperties}>
                  <span className={s.trackNo}>{pad(t.no)}</span>
                  <span className={s.trackTitle}>{t.title}</span>
                  {isTitle ? <span className={s.tag}>TITLE · OUT NOW</span> : <span className={s.lock}>{state === "released" ? "UNLOCKED" : "LOCKED ▸ 26.10"}</span>}
                </li>
              );
            })}
          </ol>
          <p className={s.note}>{release.message}</p>
          <p className={s.source}>Release details from public announcements · this page is fan-made and not an official store or source.</p>
        </div>
      </div>
    </section>
  );
}
