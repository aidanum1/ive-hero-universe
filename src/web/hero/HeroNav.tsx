"use client";
/** Prev / next hero panels. Click plays a colour cover wipe, then routes. */
import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { heroes } from "@/heroes/roster";
import type { Hero } from "@/heroes/types";
import { HeroPortrait } from "@/visual/HeroPortrait";
import { ease, gsap, sec } from "../motion/gsap";
import { useReducedMotion } from "../hooks/useMedia";
import { sfx } from "../audio/sfx";
import { withBase } from "@/lib/basePath";
import s from "./HeroNav.module.css";

export function HeroNav({ hero }: { hero: Hero }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const cover = useRef<HTMLDivElement>(null);
  const prev = heroes[(hero.index - 2 + 6) % 6];
  const next = heroes[hero.index % 6];

  const go = (e: React.MouseEvent, h: Hero, dir: 1 | -1) => {
    e.preventDefault();
    sfx.play("wipe");
    const href = `/heroes/${h.id}`;
    if (reduce || !cover.current) return router.push(href);
    router.prefetch(href);
    const el = cover.current;
    el.style.background = h.primaryColor;
    gsap
      .timeline({ onComplete: () => router.push(href) })
      .fromTo(
        el,
        { autoAlpha: 1, clipPath: dir > 0 ? "polygon(100% 0, 120% 0, 100% 100%, 80% 100%)" : "polygon(-20% 0, 0 0, -20% 100%, -40% 100%)" },
        { clipPath: "polygon(-20% 0, 120% 0, 100% 100%, -40% 100%)", duration: sec(9), ease: ease.snap },
      )
      .to({}, { duration: sec(3) });
  };

  return (
    <nav className={s.nav} aria-label="More heroes">
      <a href={withBase(`/heroes/${prev.id}/`)} className={`${s.panel} ${s.prev}`} style={{ background: prev.primaryColor, color: prev.onPrimary }} onClick={(e) => go(e, prev, -1)}>
        <span className={s.dir}>◀ PREV</span>
        <span className={s.name}>{prev.heroName}</span>
        <span className={s.real}>{prev.name}</span>
        <HeroPortrait hero={prev} className={s.portrait} showEmblem={false} />
      </a>
      <Link href="/#select" className={s.back}>
        <span>BACK TO</span>
        <strong>HERO SELECT</strong>
      </Link>
      <a href={withBase(`/heroes/${next.id}/`)} className={`${s.panel} ${s.next}`} style={{ background: next.primaryColor, color: next.onPrimary }} onClick={(e) => go(e, next, 1)}>
        <span className={s.dir}>NEXT ▶</span>
        <span className={s.name}>{next.heroName}</span>
        <span className={s.real}>{next.name}</span>
        <HeroPortrait hero={next} className={s.portrait} showEmblem={false} />
      </a>
      <div ref={cover} className={s.cover} aria-hidden />
    </nav>
  );
}
