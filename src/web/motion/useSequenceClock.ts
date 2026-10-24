"use client";
/**
 * Drives a frame-driven sequence on the website with GSAP (60fps, fractional base frames).
 * The sequence component itself is the exact one Remotion renders.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Cue } from "@/audio/cues";
import { sfx } from "../audio/sfx";
import { gsap, sec } from "./gsap";

/** `cues` fire through the Web Audio synth as the clock crosses their frames. */
export function useSequenceClock(duration: number, cues: Cue[] = []) {
  const [frame, setFrame] = useState(0);
  const state = useRef({ frame: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);

  const play = useCallback(
    (from = 0, onComplete?: () => void) => {
      tween.current?.kill();
      state.current.frame = from;
      setFrame(from);
      let last = from - 0.001;
      sfx.cues(cues, last, from);
      tween.current = gsap.to(state.current, {
        frame: duration,
        duration: sec(duration - from),
        ease: "none",
        onUpdate: () => {
          sfx.cues(cues, last, state.current.frame);
          last = state.current.frame;
          setFrame(state.current.frame);
        },
        onComplete,
      });
    },
    [duration, cues],
  );

  const seek = useCallback((f: number) => {
    tween.current?.kill();
    state.current.frame = f;
    setFrame(f);
  }, []);

  useEffect(() => () => void tween.current?.kill(), []);
  return { frame, play, seek };
}
