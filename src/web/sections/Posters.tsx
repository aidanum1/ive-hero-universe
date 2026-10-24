"use client";
/**
 * NOW SHOWING — fake one-sheets & an editorial cover.
 * Desktop: pinned horizontal dolly with poster parallax. Phone / reduced motion: native
 * swipe carousel with scroll-snap.
 */
import { useRef } from "react";
import { posters } from "@/visual/Posters";
import { gsap, useGSAP } from "../motion/gsap";
import { useMedia, useReducedMotion } from "../hooks/useMedia";
import s from "./Posters.module.css";

export function Posters() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const desktop = useMedia("(min-width: 1100px)", true);

  useGSAP(
    () => {
      if (reduce || !desktop || !track.current) return;
      const q = gsap.utils.selector(root);
      const distance = () => track.current!.scrollWidth - window.innerWidth;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
      });
      tl.to(track.current, { x: () => -distance(), ease: "none" }, 0);
      q("[data-poster-art]").forEach((el, i) => {
        tl.fromTo(el, { xPercent: 6, rotate: i % 2 ? 3 : -3 }, { xPercent: -6, rotate: i % 2 ? -1.5 : 1.5, ease: "none" }, 0);
      });
    },
    { scope: root, revertOnUpdate: true, dependencies: [reduce, desktop] },
  );

  return (
    <section ref={root} id="posters" className={s.posters} aria-labelledby="posters-title">
      <div ref={track} className={s.track}>
        <header className={s.intro}>
          <p className={s.kicker}>NOW SHOWING · IN THEATERS NEVER</p>
          <h2 id="posters-title" className={s.title}>
            Four posters
            <br />
            <em>for a film that doesn&apos;t exist.</em>
          </h2>
          <p className={s.lede}>
            Saul-Bass minimalism, a crowded 90s anime print, a fashion cover and an on-set teaser — the same six heroes, four poster grammars. Every frame is vector, every credit is fan-made.
          </p>
          <p className={s.scrollHint} aria-hidden>
            {desktop ? "SCROLL ▶▶" : "SWIPE ▶▶"}
          </p>
        </header>
        {posters.map(({ id, title, note, Component, accent }, i) => (
          <figure key={id} className={s.poster} style={{ "--accent": accent } as React.CSSProperties}>
            <div className={s.art} data-poster-art>
              <Component />
            </div>
            <figcaption className={s.caption}>
              <span className={s.no}>{String(i + 1).padStart(2, "0")}</span>
              <span className={s.capTitle}>{title}</span>
              <span className={s.capNote}>{note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
