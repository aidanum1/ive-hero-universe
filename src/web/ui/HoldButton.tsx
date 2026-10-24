"use client";
/**
 * HOLD TO CHARGE — press-and-hold (mouse, touch or Space/Enter) to charge a hero's power.
 * Releasing early bleeds the charge back. Reports progress so the stage can react.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { dur } from "@/design/motion";
import { gsap, sec } from "../motion/gsap";
import { sfx } from "../audio/sfx";
import s from "./HoldButton.module.css";

const CHARGE_FRAMES = 34;

export function HoldButton({
  label = "HOLD TO CHARGE",
  accent,
  onCharge,
  onFire,
  disabled,
  className,
}: {
  label?: string;
  accent: string;
  onCharge?: (p: number) => void;
  onFire: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const state = useRef({ p: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const [phase, setPhase] = useState<"idle" | "charging" | "fired">("idle");
  const voice = useRef<ReturnType<typeof sfx.chargeVoice>>(null);

  const apply = useCallback(() => {
    ref.current?.style.setProperty("--charge", state.current.p.toFixed(3));
    voice.current?.set(state.current.p);
    onCharge?.(state.current.p);
  }, [onCharge]);

  const start = useCallback(() => {
    if (disabled || phase === "fired") return;
    setPhase("charging");
    sfx.unlock();
    voice.current?.stop();
    voice.current = sfx.chargeVoice();
    tween.current?.kill();
    tween.current = gsap.to(state.current, {
      p: 1,
      duration: sec(CHARGE_FRAMES) * (1 - state.current.p),
      ease: "none",
      onUpdate: apply,
      onComplete: () => {
        setPhase("fired");
        voice.current?.stop();
        voice.current = null;
        sfx.play("ting");
        onFire();
        gsap.to(state.current, { p: 0, duration: sec(dur.slow), delay: sec(dur.base), ease: "power2.out", onUpdate: apply, onComplete: () => setPhase("idle") });
      },
    });
  }, [apply, disabled, onFire, phase]);

  const release = useCallback(() => {
    if (phase !== "charging") return;
    setPhase("idle");
    tween.current?.kill();
    voice.current?.stop();
    voice.current = null;
    tween.current = gsap.to(state.current, { p: 0, duration: sec(dur.quick), ease: "power2.out", onUpdate: apply });
  }, [apply, phase]);

  useEffect(
    () => () => {
      tween.current?.kill();
      voice.current?.stop();
    },
    [],
  );

  return (
    <button
      ref={ref}
      type="button"
      className={`${s.hold} ${className ?? ""}`}
      style={{ "--accent": accent } as CSSProperties}
      data-phase={phase}
      disabled={disabled}
      aria-label={`${label} — press and hold`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        start();
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") release();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg className={s.ring} viewBox="0 0 44 44" aria-hidden>
        <circle cx="22" cy="22" r="18" className={s.track} />
        <circle cx="22" cy="22" r="18" className={s.meter} pathLength={1} />
        <path d="M24 9 L15 24 h6 l-3 11 l10 -15 h-6 z" className={s.bolt} />
      </svg>
      <span className={s.text}>
        <span className={s.label}>{phase === "charging" ? "CHARGING…" : phase === "fired" ? "POWER!" : label}</span>
        <span className={s.bar} aria-hidden>
          <span />
        </span>
      </span>
    </button>
  );
}
