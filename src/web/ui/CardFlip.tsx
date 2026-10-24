"use client";
/**
 * Lightweight CSS-3D holo card: pointer tilt, glare, rainbow foil sheen, tap to flip.
 * Uses the shared SVG TradingCard faces. Also the no-WebGL fallback for the 3D gallery.
 */
import { useRef, useState, type CSSProperties } from "react";
import type { Hero } from "@/heroes/types";
import { TradingCard } from "@/visual/TradingCard";
import { ease, gsap, sec } from "../motion/gsap";
import { useReducedMotion } from "../hooks/useMedia";
import { sfx } from "../audio/sfx";
import s from "./CardFlip.module.css";

export function CardFlip({ hero, className, style }: { hero: Hero; className?: string; style?: CSSProperties }) {
  const card = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();

  const tilt = (e: React.PointerEvent) => {
    if (reduce || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.current.style.setProperty("--px", px.toFixed(3));
    card.current.style.setProperty("--py", py.toFixed(3));
    card.current.style.setProperty("--hover", "1");
    gsap.to(card.current, { "--rx": (0.5 - py) * 22, "--ry": (px - 0.5) * 26, duration: sec(6), ease: ease.glide, overwrite: "auto" });
  };
  const reset = () => {
    if (!card.current) return;
    card.current.style.setProperty("--hover", "0");
    gsap.to(card.current, { "--rx": 0, "--ry": 0, duration: sec(18), ease: ease.overshootSoft, overwrite: "auto" });
  };
  const flip = () => {
    sfx.play("flip");
    sfx.play("glint", { delay: 0.18, volume: 0.7 });
    setFlipped((f) => !f);
    if (!card.current || reduce) return;
    gsap.fromTo(card.current, { "--lift": 1 }, { "--lift": 0, duration: sec(20), ease: ease.glide });
  };

  return (
    <div className={`${s.scene} ${className ?? ""}`} style={style}>
      <button
        type="button"
        ref={card as unknown as React.RefObject<HTMLButtonElement>}
        className={s.card}
        data-flipped={flipped}
        aria-pressed={flipped}
        aria-label={`${hero.heroName} trading card — ${flipped ? "showing back" : "showing front"}. Activate to flip.`}
        onPointerMove={tilt}
        onPointerLeave={reset}
        onClick={flip}
      >
        <span className={`${s.face} ${s.front}`}>
          <TradingCard hero={hero} width="100%" />
          <span className={s.foil} aria-hidden />
          <span className={s.glare} aria-hidden />
        </span>
        <span className={`${s.face} ${s.back}`}>
          <TradingCard hero={hero} side="back" width="100%" />
          <span className={s.glare} aria-hidden />
        </span>
      </button>
    </div>
  );
}
