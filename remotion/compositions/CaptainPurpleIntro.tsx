import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/anton/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "../../src/app/globals.css";
import { FrameArt, frameStyle } from "../../src/components/FrameArt";
import { IVELogo, SignalMarks } from "../../src/design-system/Marks";
import { sampleOpening } from "../../src/motion/sample";
import { motion, clamp } from "../../src/motion/config";

export function CaptainPurpleIntro() {
  const frame = useCurrentFrame(),
    { fps, width, height } = useVideoConfig();
  const portrait = height > width;
  const surfaceWidth = portrait ? 390 : 1440;
  const scale = width / surfaceWidth;
  const chargeStart = 34 * fps;
  const burstStart = chargeStart + (motion.chargeMs * fps) / 1000;
  const burstEnd = burstStart + (motion.burstMs * fps) / 1000;
  const progress = interpolate(
    frame,
    [0, 3 * fps, 10 * fps, 16 * fps, 24 * fps, chargeStart],
    [0, 0.08, 0.26, 0.42, 0.6, 0.64],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const action =
    frame < chargeStart
      ? "idle"
      : frame < burstStart
        ? "charging"
        : frame < burstEnd
          ? "bursting"
          : "completed";
  const visual = sampleOpening({
    progress,
    charge:
      action === "charging"
        ? clamp((frame - chargeStart) / (burstStart - chargeStart))
        : action === "bursting"
          ? 1
          : 0,
    eventMs: Math.max(0, ((frame - burstStart) * 1000) / fps),
    action,
    reduced: false,
    pointerX: 0,
    pointerY: 0,
  });
  return (
    <AbsoluteFill style={{ background: "#101014" }}>
      <div
        className="experience videoSurface"
        style={{
          ...frameStyle(visual),
          width: surfaceWidth,
          height: height / scale,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
        }}
      >
        <FrameArt
          portraitSrc={staticFile("heroes/captain-purple.webp")}
          pageSrc={staticFile("assets/comic-page.svg")}
        />
        <div
          style={{
            position: "absolute",
            top: 26,
            left: 24,
            color: "#f0ebdd",
            mixBlendMode: "difference",
            display: "flex",
            alignItems: "center",
            gap: 13,
            zIndex: 10,
          }}
        >
          <div style={{ width: 55 }}>
            <IVELogo />
          </div>
          <span style={{ fontSize: 8, letterSpacing: 1 }}>
            HERO
            <br />
            UNIVERSE
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 24,
            right: 24,
            borderTop: "1px solid #f0ebdd50",
            paddingTop: 16,
            color: "#f0ebdd",
            mixBlendMode: "difference",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
            fontSize: 7,
            letterSpacing: 1,
          }}
        >
          <span>ISSUE 00 / THE AWAKENING</span>
          <SignalMarks active={progress > 0.42} />
        </div>
      </div>
    </AbsoluteFill>
  );
}
