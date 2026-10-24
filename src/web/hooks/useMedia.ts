"use client";
import { useSyncExternalStore } from "react";
import { mq } from "@/design/tokens";

function subscribe(query: string) {
  return (cb: () => void) => {
    const m = window.matchMedia(query);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  };
}

/** SSR-safe media query hook (server snapshot = `fallback`). */
export function useMedia(query: string, fallback = false) {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const useReducedMotion = () => useMedia(mq.reduce);
export const useIsDesktop = () => useMedia(mq.desktop, true);
export const useIsTablet = () => useMedia(mq.tablet, true);
