"use client";
/**
 * @remotion/player wrapper for the website. Plays registry pieces at 60fps on the web
 * (the frame-driven sequences resample to base frames), pauses when offscreen and
 * honours reduced motion by showing a still poster frame until the user presses play.
 */
import { useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import type { MotionPiece } from "@/sequences/registry";
import { useReducedMotion } from "../hooks/useMedia";
import { useSfxState } from "../audio/useSfx";
import s from "./MotionPlayer.module.css";

const WEB_FPS = 60;

export default function MotionPlayer({
  piece,
  inputProps,
  autoPlay = true,
  loop = true,
  controls = true,
  posterFrame,
  className,
  sound = "follow",
}: {
  /** "follow" = soundtrack follows the site SFX toggle; "muted" = starts muted (ambient loops). */
  sound?: "follow" | "muted";
  piece: MotionPiece;
  inputProps?: Record<string, unknown>;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  /** Base frame shown as the still under reduced motion. */
  posterFrame?: number;
  className?: string;
}) {
  const ref = useRef<PlayerRef>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { enabled } = useSfxState();
  const audible = sound === "follow" && enabled;
  const scale = WEB_FPS / piece.fps;

  // The cut's soundtrack follows the site-wide SFX toggle.
  useEffect(() => {
    if (sound !== "follow") return;
    if (audible) ref.current?.unmute();
    else ref.current?.mute();
  }, [audible, sound]);
  const duration = Math.round(piece.durationInFrames * scale);

  useEffect(() => {
    const el = wrap.current;
    const player = ref.current;
    if (!el || !player) return;
    if (reduce) {
      player.pause();
      player.seekTo(Math.round((posterFrame ?? piece.durationInFrames - 1) * scale));
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) player.pause();
        else if (autoPlay) player.play();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, autoPlay, posterFrame, piece.durationInFrames, scale]);

  return (
    <div ref={wrap} className={`${s.wrap} ${className ?? ""}`}>
      <Player
        ref={ref}
        component={piece.component}
        inputProps={{ ...piece.defaultProps, ...inputProps }}
        durationInFrames={duration}
        compositionWidth={piece.width}
        compositionHeight={piece.height}
        fps={WEB_FPS}
        controls={controls}
        initiallyMuted={!audible}
        loop={loop}
        clickToPlay
        spaceKeyToPlayOrPause={false}
        style={{ width: "100%", aspectRatio: `${piece.width} / ${piece.height}` }}
        acknowledgeRemotionLicense
      />
    </div>
  );
}
