/**
 * Shared building blocks for frame-driven sequences (1080×1920 vertical canvas).
 * Every sequence is a pure function of `frame` (base frames @30fps) → SVG.
 */
import type { CSSProperties, ReactNode } from "react";
import { BASE_FPS } from "@/design/motion";
import { color, fxProfile, video, type FxProfile } from "@/design/tokens";
import { family } from "@/design/typography";
import { owner } from "@/content/project";

export const W = video.width;
export const H = video.height;

export type SeqProps = {
  /** Current time in base frames (30fps). May be fractional on 60fps playback. */
  frame: number;
  fx?: FxProfile;
};

/** Root SVG for a sequence. Scales to any container; aspect locked to 9:16. */
export function SeqSvg({ children, background = color.ink, style }: { children: ReactNode; background?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: "block", background, overflow: "hidden", ...style }}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** SMPTE-ish timecode for HUD overlays. */
export function timecode(frame: number, fps = BASE_FPS) {
  const f = Math.max(0, Math.floor(frame));
  const ff = f % fps;
  const s = Math.floor(f / fps);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `00:00:${pad(s)}:${pad(ff)}`;
}

export const defaultFx: FxProfile = fxProfile.video;

/** Small HUD label in pixel type. */
export function Hud({ x, y, children, size = 30, fill = color.paper, anchor = "start", opacity = 1 }: { x: number; y: number; children: ReactNode; size?: number; fill?: string; anchor?: "start" | "middle" | "end"; opacity?: number }) {
  return (
    <text x={x} y={y} fontFamily={family.pixel} fontSize={size} fill={fill} textAnchor={anchor} letterSpacing={size * 0.04} opacity={opacity}>
      {children}
    </text>
  );
}

/** Wide-tracked editorial label. */
export function Label({ x, y, children, size = 28, fill = color.paper, anchor = "start", weight = 800, stretch = "125%", spacing = 0.18 }: { x: number; y: number; children: ReactNode; size?: number; fill?: string; anchor?: "start" | "middle" | "end"; weight?: number; stretch?: string; spacing?: number }) {
  return (
    <text x={x} y={y} fontFamily={family.wide} fontWeight={weight} fontStretch={stretch} fontSize={size} fill={fill} textAnchor={anchor} letterSpacing={size * spacing}>
      {children}
    </text>
  );
}

/** Persistent fan-made watermark for every video output. */
export function FanMark({ fill = color.paper, opacity = 0.75 }: { fill?: string; opacity?: number }) {
  return (
    <Hud x={W / 2} y={H - 64} size={24} fill={fill} anchor="middle" opacity={opacity}>
      {`UNOFFICIAL FAN-MADE BY ${owner.handle.toUpperCase()} · NOT AFFILIATED WITH IVE / STARSHIP`}
    </Hud>
  );
}
