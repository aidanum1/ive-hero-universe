"use client";
import { useEffect, useSyncExternalStore } from "react";
import type { SoundId } from "@/audio/sounds";
import { sfx } from "./sfx";

/** Live SFX state for toggles ({ enabled, ready }). */
export function useSfxState() {
  const enabled = useSyncExternalStore(sfx.subscribe, () => sfx.enabled, () => true);
  const ready = useSyncExternalStore(sfx.subscribe, () => sfx.ready, () => false);
  return { enabled, ready };
}

const COMMON: SoundId[] = ["cursor", "select", "whoosh", "pop", "impact", "wipe", "confirm", "zip", "gust", "glint", "tok", "whirl", "shot", "stamp", "flip", "tick", "menuOpen", "menuClose"];

/** Unlocks audio on the first user gesture anywhere on the page, then pre-warms sounds. */
export function useSfxUnlock() {
  useEffect(() => {
    const unlock = () => {
      sfx.unlock();
      sfx.warm(COMMON);
    };
    const opts = { once: true, capture: true } as const;
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    return () => {
      window.removeEventListener("pointerdown", unlock, opts);
      window.removeEventListener("keydown", unlock, opts);
    };
  }, []);
}
