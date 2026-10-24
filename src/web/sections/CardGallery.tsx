"use client";
/**
 * HOLO CARDS — the 3D trading-card gallery.
 * Lazy-loads the WebGL scene only near the viewport, stops rendering offscreen, pins for a
 * scroll-choreographed camera move, then hands control to drag / tap / flip.
 * Falls back to CSS-3D cards without WebGL or with reduced motion.
 */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import { heroes } from "@/heroes/roster";
import { gsap, ScrollTrigger, useGSAP } from "../motion/gsap";
import { useInView } from "../hooks/useInView";
import { useMedia, useReducedMotion } from "../hooks/useMedia";
import { CardFlip } from "../ui/CardFlip";
import { sfx } from "../audio/sfx";
import { semis } from "@/audio/cues";
import type { GalleryState } from "../three/CardGalleryCanvas";
import { STEP, ringRotation } from "../three/ring";
import s from "./CardGallery.module.css";

const CardGalleryCanvas = dynamic(() => import("../three/CardGalleryCanvas"), { ssr: false });

let webgl: boolean | undefined;
function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
const noSubscribe = () => () => {};

export function CardGallery() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const phone = !useMedia("(min-width: 720px)", true);
  const near = useInView(root, "600px 0px", true);
  const visible = useInView(root, "0px");
  /** null on the server; detected once on the client. */
  const gl = useSyncExternalStore(noSubscribe, hasWebGL, () => null);
  const [front, setFront] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const state = useRef<GalleryState>({ scroll: 0, drag: 0, dragVel: 0, dragging: false, selected: null, flipped: false, pointer: { x: 0, y: 0 } });
  const drag = useRef<{ x: number; moved: number } | null>(null);

  const use3d = gl === true && !reduce;

  useGSAP(
    () => {
      if (!use3d) return;
      gsap.to(state.current, {
        scroll: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=180%", pin: true, scrub: 0.6 },
      });
      // This pin is created after WebGL detection, i.e. after triggers further down the
      // page — re-sort by page position and recompute so their starts include our spacer.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    },
    { scope: root, revertOnUpdate: true, dependencies: [use3d] },
  );

  // Drag inertia + snap-to-card, integrated on GSAP's ticker while the gallery is visible.
  useEffect(() => {
    if (!use3d || !visible) return;
    const tick = (_time: number, deltaMs: number) => {
      const st = state.current;
      const dt = Math.min(0.05, deltaMs / 1000);
      if (st.dragging || gsap.isTweening(st)) return;
      st.drag += st.dragVel;
      st.dragVel *= Math.pow(0.02, dt);
      if (Math.abs(st.dragVel) < 0.0004) {
        const total = ringRotation(st.scroll, st.drag);
        st.drag += (Math.round(total / STEP) * STEP - total) * (1 - Math.pow(0.004, dt));
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [use3d, visible]);

  /** Tap the pulled card again to flip it; tap another card (or null) to change selection. */
  const select = useCallback((i: number | null) => {
    const st = state.current;
    if (i !== null && st.selected === i) {
      st.flipped = !st.flipped;
      sfx.play("flip");
      sfx.play("glint", { delay: 0.2, volume: 0.7 });
    } else {
      sfx.play(i === null ? "deal" : "whoosh", { rate: i === null ? 0.8 : 1.3, volume: 0.7 });
      st.selected = i;
      st.flipped = false;
    }
    setSelected(st.selected);
    setFlipped(st.flipped);
  }, []);

  const spin = (dir: 1 | -1) => {
    sfx.play("whoosh", { volume: 0.5, pan: dir * 0.4 });
    select(null);
    state.current.dragVel = 0;
    gsap.to(state.current, { drag: state.current.drag - dir * STEP, duration: 0.6, ease: "power3.out" });
  };

  const onFront = useCallback((i: number) => {
    setFront(i);
    sfx.play("tick", { rate: semis(heroes[i].sound.note), volume: 0.8 });
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    const r = root.current!.getBoundingClientRect();
    state.current.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    state.current.pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    if (drag.current) {
      const dx = e.clientX - drag.current.x;
      drag.current.x = e.clientX;
      drag.current.moved += Math.abs(dx);
      const k = (Math.PI * 1.6) / r.width;
      state.current.drag += dx * k;
      state.current.dragVel = dx * k;
      if (drag.current.moved > 6) state.current.dragging = true;
    }
  };
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, moved: 0 };
    state.current.dragVel = 0;
  };
  const endDrag = () => {
    drag.current = null;
    state.current.dragging = false;
  };

  const hero = heroes[selected ?? front];

  return (
    <section ref={root} id="cards" className={s.cards} style={{ "--hero": hero.primaryColor, "--hero-2": hero.secondaryColor } as CSSProperties} aria-labelledby="cards-title">
      <header className={s.head}>
        <p className={s.kicker}>HOLO CARDS · 06 COLLECTIBLES</p>
        <h2 id="cards-title" className={s.title}>
          Collect all <em>six.</em>
        </h2>
      </header>

      {use3d ? (
        <div className={s.stage} onPointerMove={onPointerMove} onPointerDown={onPointerDown} onPointerUp={endDrag} onPointerCancel={endDrag} onPointerLeave={endDrag}>
          {near ? (
            <CardGalleryCanvas state={state} active={visible} onFront={onFront} onSelect={select} quality={phone ? "low" : "high"} />
          ) : null}
          <div className={s.controls}>
            <button type="button" className={s.arrow} onClick={() => spin(-1)} aria-label="Previous card">
              ◀
            </button>
            <div className={s.readout} aria-live="polite">
              <span className={s.no}>{String(hero.index).padStart(2, "0")}/06</span>
              <span className={s.name}>{hero.heroName}</span>
              <span className={s.hint}>{selected === null ? "DRAG TO SPIN · TAP A CARD" : flipped ? "TAP AGAIN TO FLIP BACK" : "TAP AGAIN TO FLIP"}</span>
            </div>
            <button type="button" className={s.arrow} data-gallery="next" onClick={() => spin(1)} aria-label="Next card">
              ▶
            </button>
          </div>
          <div className={s.actions}>
            <button type="button" className={s.action} data-gallery="pull" onClick={() => select(selected ?? front)}>
              {selected === null ? "PULL CARD" : "FLIP"}
            </button>
            {selected !== null ? (
              <button type="button" className={s.action} onClick={() => select(null)}>
                RETURN
              </button>
            ) : null}
            <Link className={s.link} href={`/heroes/${hero.id}`}>
              VIEW HERO ▶
            </Link>
          </div>
        </div>
      ) : (
        <div className={s.fallback}>
          {heroes.map((h) => (
            <CardFlip key={h.id} hero={h} />
          ))}
        </div>
      )}
    </section>
  );
}
