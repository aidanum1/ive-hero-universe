"use client";
/** Dev-only handle so QA scripts can scrub timelines deterministically (window.__ive.opening.progress(0.4)). */
export function exposeTimeline(name: string, tl: gsap.core.Animation) {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return;
  const w = window as unknown as { __ive?: Record<string, gsap.core.Animation> };
  w.__ive = { ...(w.__ive ?? {}), [name]: tl };
}
