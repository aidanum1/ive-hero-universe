"use client";
/**
 * Floating game-HUD navigation: logo lockup, live section indicator, comic-panel menu.
 * Ink chips float above every section so the nav reads on paper, pastel and black.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sections } from "@/content/sections";
import { disclaimer } from "@/content/release";
import { owner } from "@/content/project";
import { withBase } from "@/lib/basePath";
import { heroes } from "@/heroes/roster";
import { ease, gsap, sec, useGSAP } from "../motion/gsap";
import { useReducedMotion } from "../hooks/useMedia";
import { sfx } from "../audio/sfx";
import { useSfxState, useSfxUnlock } from "../audio/useSfx";
import s from "./SiteNav.module.css";

const panelColors = [heroes[0].primaryColor, heroes[1].primaryColor, heroes[2].primaryColor, heroes[3].primaryColor, heroes[4].primaryColor, heroes[5].primaryColor, "var(--c-paper)", "var(--c-paper)"];

export function SiteNav({ home = true }: { home?: boolean }) {
  const [current, setCurrent] = useState<string>("opening");
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { enabled: sound } = useSfxState();
  useSfxUnlock();

  const toggleMenu = () =>
    setOpen((v) => {
      sfx.play(v ? "menuClose" : "menuOpen");
      return !v;
    });

  useEffect(() => {
    if (!home) return;
    const els = sections.map((x) => document.getElementById(x.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [home]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sfx.play("menuClose");
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useGSAP(
    () => {
      if (!open || reduce) return;
      const q = gsap.utils.selector(menu);
      gsap
        .timeline()
        .fromTo(q("[data-panel]"), { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: sec(8), ease: ease.snap, stagger: sec(1.2) })
        .fromTo(q("[data-panel-title]"), { yPercent: 110 }, { yPercent: 0, duration: sec(9), ease: ease.overshootSoft, stagger: sec(1.2) }, sec(4));
    },
    { scope: menu, dependencies: [open, reduce] },
  );

  const active = sections.find((x) => x.id === current) ?? sections[0];

  return (
    <>
      <header className={s.nav}>
        <Link href="/" className={s.logo} aria-label="IVE Hero Universe — home">
          <span className={s.logoIve}>IVE</span>
          <span className={s.logoSub}>
            HERO
            <br />
            UNIVERSE
          </span>
        </Link>
        <div className={s.right}>
          <a href={home ? "#credits" : withBase("/#credits")} className={s.fan} title={disclaimer.long}>
            <span className={s.fanLong}>UNOFFICIAL </span>FAN-MADE
          </a>
          {home ? (
            <p className={s.indicator} aria-live="polite">
              <span className={s.blink}>▶</span> {active.no} <span className={s.indicatorLabel}>{active.label}</span>
            </p>
          ) : null}
          <button
            type="button"
            className={s.soundBtn}
            aria-pressed={sound}
            aria-label={sound ? "Sound effects on — turn off" : "Sound effects off — turn on"}
            onClick={() => {
              sfx.setEnabled(!sound);
              if (!sound) sfx.play("select");
            }}
          >
            <svg viewBox="0 0 20 16" aria-hidden className={s.soundIcon}>
              <path d="M1 5h4l5-4v14l-5-4H1z" fill="currentColor" />
              {sound ? <path d="M13 4c2 2 2 6 0 8M15.5 1.5c3.5 3.5 3.5 9.5 0 13" fill="none" stroke="currentColor" strokeWidth="1.8" /> : <path d="M13 5l6 6M19 5l-6 6" stroke="currentColor" strokeWidth="1.8" />}
            </svg>
            <span className={s.soundLabel}>{sound ? "SFX ON" : "SFX OFF"}</span>
          </button>
          <button type="button" className={s.menuBtn} aria-expanded={open} aria-controls="site-menu" onClick={toggleMenu}>
            {open ? "CLOSE ✕" : "MENU ☰"}
          </button>
        </div>
      </header>

      {open ? (
        <div id="site-menu" ref={menu} className={s.menu} role="dialog" aria-modal="true" aria-label="Site menu">
          <ol className={s.grid}>
            {sections.map((x, i) => (
              <li key={x.id} className={s.cell}>
                <a
                  href={home ? `#${x.id}` : withBase(`/#${x.id}`)}
                  className={s.panel}
                  data-panel
                  style={{ background: panelColors[i], color: i === 1 || i === 2 || i === 3 || i >= 6 ? "var(--c-ink)" : "var(--c-white)" }}
                  onClick={() => {
                    sfx.play("select");
                    setOpen(false);
                  }}
                  onPointerEnter={() => sfx.play("cursor", { rate: 1 + i * 0.06 })}
                >
                  <span className={s.panelNo}>{x.no}</span>
                  <span className={s.panelTitleWrap}>
                    <span className={s.panelTitle} data-panel-title>
                      {x.title}
                    </span>
                  </span>
                  <span className={s.panelLabel}>{x.label}</span>
                </a>
              </li>
            ))}
          </ol>
          <p className={s.menuOwner}>
            FAN PROJECT BY{" "}
            <a href={owner.url} target="_blank" rel="noopener noreferrer">
              {owner.handle}
            </a>{" "}
            · {owner.platform}
          </p>
          <p className={s.menuFoot}>
            {heroes.map((h) => (
              <Link key={h.id} href={`/heroes/${h.id}`} onClick={() => setOpen(false)} style={{ color: h.primaryColor }}>
                {h.heroName}
              </Link>
            ))}
          </p>
        </div>
      ) : null}
    </>
  );
}
