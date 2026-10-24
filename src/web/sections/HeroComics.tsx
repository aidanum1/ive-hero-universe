"use client";
/**
 * HERO COMICS — guided-view camera over one comic page.
 * Scroll is a dolly: overview → panel by panel (each with its own dutch angle, balloons
 * and SFX popping as the camera lands) → pull back to the full page.
 * Tap a panel to replay its SFX. Reduced motion: the page is simply laid out to read.
 */
import { useEffect, useRef, useState } from "react";
import { comicPanels, ComicPage, PAGE_H, PAGE_W } from "@/visual/ComicPage";
import { ease, gsap, sec, useGSAP } from "../motion/gsap";
import { useReducedMotion } from "../hooks/useMedia";
import { sfx } from "../audio/sfx";
import { heroById } from "@/heroes/roster";
import s from "./HeroComics.module.css";

type Cam = { cx: number; cy: number; s: number; r: number };

function frameFor(box: [number, number, number, number], tilt: number, vw: number, vh: number): Cam {
  const [x, y, w, h] = box;
  const phone = vw < 720;
  const scale = Math.min((vw * (phone ? 0.96 : 0.84)) / w, (vh * (phone ? 0.74 : 0.8)) / h);
  return { cx: x + w / 2, cy: y + h / 2, s: scale, r: tilt };
}
const overview = (vw: number, vh: number): Cam => ({ cx: PAGE_W / 2, cy: PAGE_H / 2, s: Math.min((vw * 0.92) / PAGE_W, (vh * 0.86) / PAGE_H), r: 0 });

export function HeroComics() {
  const root = useRef<HTMLElement>(null);
  const page = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  const [panelIdx, setPanelIdx] = useState(-1);

  useGSAP(
    () => {
      if (!page.current || !root.current) return;
      if (reduce) {
        // The camera writes transform directly (not via GSAP), so clear it ourselves.
        page.current.style.transform = "";
        return;
      }
      const q = gsap.utils.selector(root);
      const cam: Cam = { cx: PAGE_W / 2, cy: PAGE_H / 2, s: 0.3, r: 0 };
      const apply = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        page.current!.style.transform = `translate(${vw / 2}px, ${vh / 2}px) rotate(${cam.r}deg) scale(${cam.s}) translate(${-cam.cx}px, ${-cam.cy}px)`;
      };
      const target = (i: number) => () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        return i < 0 ? overview(vw, vh) : frameFor(comicPanels[i].box, comicPanels[i].tilt, vw, vh);
      };
      Object.assign(cam, overview(window.innerWidth, window.innerHeight));
      apply();

      // Hide balloons / SFX until the camera arrives at their panel.
      gsap.set(q("[data-balloon]"), { scale: 0.2, autoAlpha: 0, transformOrigin: "50% 50%" });
      gsap.set(q("[data-sfx]"), { scale: 2.2, autoAlpha: 0, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${(comicPanels.length + 1.4) * window.innerHeight * 0.85}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          snap: { snapTo: "labels", duration: { min: 0.2, max: 0.7 }, delay: 0.08, ease: "power2.inOut" },
          onUpdate: (self) => {
            const p = self.progress * (comicPanels.length + 1);
            setPanelIdx(Math.min(comicPanels.length - 1, Math.max(-1, Math.round(p) - 1)));
          },
        },
      });

      tl.addLabel("overview").to(q("[data-intro]"), { autoAlpha: 0, yPercent: -30, duration: 0.3 }, 0.1);
      comicPanels.forEach((p, i) => {
        const t = target(i);
        // Function-based values are re-evaluated on refresh (resize / rotation).
        tl.to(cam, { cx: () => t().cx, cy: () => t().cy, s: () => t().s, r: () => t().r, duration: 1, ease: ease.snap, onUpdate: apply }, i === 0 ? 0.2 : ">")
          .addLabel(p.id)
          .to(q(`[data-panel='${p.id}'] [data-balloon]`), { scale: 1, autoAlpha: 1, duration: 0.25, ease: ease.overshoot, stagger: 0.05 }, "<+0.55")
          .to(q(`[data-panel='${p.id}'] [data-sfx]`), { scale: 1, autoAlpha: 1, duration: 0.2, ease: ease.punch }, "<+0.1")
          .to({}, { duration: 0.35 });
      });
      const ov = target(-1);
      tl.to(cam, { cx: () => ov().cx, cy: () => ov().cy, s: () => ov().s, r: 0, duration: 1.2, ease: ease.glide, onUpdate: apply }).addLabel("end").to(q("[data-outro]"), { autoAlpha: 1, duration: 0.3 }, "<+0.6");

      const onResize = () => apply();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { scope: root, revertOnUpdate: true, dependencies: [reduce] },
  );

  // Page-turn on every camera landing, then the balloons pop.
  useEffect(() => {
    if (panelIdx < 0) return;
    sfx.play("pageTurn", { volume: 0.7 });
    sfx.play("pop", { delay: 0.28, volume: 0.6 });
  }, [panelIdx]);

  const replay = (e: React.MouseEvent) => {
    const panel = (e.target as Element).closest<HTMLElement>("[data-panel]");
    const lettering = panel?.querySelector("[data-sfx]");
    const meta = comicPanels.find((p) => p.id === panel?.dataset.panel);
    sfx.play(meta?.hero ? heroById[meta.hero].sound.power : "pop", { volume: 0.7 });
    if (!lettering || reduce) return;
    gsap.fromTo(lettering, { scale: 1.8, rotate: -10 }, { scale: 1, rotate: 0, duration: sec(8), ease: ease.overshoot, transformOrigin: "50% 50%" });
  };

  const current = panelIdx >= 0 ? comicPanels[panelIdx] : null;

  return (
    <section ref={root} id="comics" className={s.comics} data-reduce={reduce} aria-labelledby="comics-title">
      <div className={s.viewport}>
        <svg ref={page} className={s.page} viewBox={`0 0 ${PAGE_W} ${PAGE_H}`} width={PAGE_W} height={PAGE_H} onClick={replay} role="img" aria-label="Hero Comics issue 5: Training Day — a six-hero comic page">
          <ComicPage />
        </svg>
      </div>

      <header className={s.intro} data-intro>
        <p className={s.kicker}>HERO COMICS · ISSUE Nº05</p>
        <h2 id="comics-title" className={s.title}>
          Training <em>Day</em>
        </h2>
        <p className={s.hint}>SCROLL TO READ ▼ · TAP A PANEL</p>
      </header>

      <div className={s.hud} aria-hidden>
        <span>PANEL</span>
        <b>{current ? String(panelIdx + 1).padStart(2, "0") : "--"}</b>
        <span>/ {String(comicPanels.length).padStart(2, "0")}</span>
        {current?.hero ? <i>{current.hero.toUpperCase()}</i> : null}
      </div>
      <p className={s.outro} data-outro>
        THE END? · <span>LOOKS CAN KILL — OUT 26.10</span>
      </p>
    </section>
  );
}
