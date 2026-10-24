/**
 * Adapts a pure frame-driven sequence to Remotion's clock and lays its cue sheet onto the
 * timeline as <Audio> clips. The same wrapped component is registered as a <Composition>
 * and embedded on the website through @remotion/player (where the clips play too).
 */
import type { ComponentType } from "react";
import { AbsoluteFill, getRemotionEnvironment, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { BASE_FPS, toBaseFrame } from "@/design/motion";
import { MASTER, type Cue } from "@/audio/cues";
import type { SoundId } from "@/audio/sounds";
import { withBase } from "@/lib/basePath";
import type { SeqProps } from "./kit";

/** WAVs live in /public/sfx (rendered by scripts/build-sfx.mjs). */
const sfxSrc = (id: SoundId) => (getRemotionEnvironment().isPlayer ? withBase(`/sfx/${id}.wav`) : staticFile(`sfx/${id}.wav`));

export function frameDriven<P extends object>(Seq: ComponentType<SeqProps & P>, name: string, cues?: (props: P) => Cue[]) {
  function FrameDriven(props: P) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const sheet = cues?.(props) ?? [];
    return (
      <AbsoluteFill>
        <Seq {...props} frame={toBaseFrame(frame, fps)} />
        {sheet.map((c, i) => (
          <Audio
            key={`${c.sound}-${i}`}
            src={sfxSrc(c.sound)}
            from={Math.round((c.at * fps) / BASE_FPS)}
            volume={(c.volume ?? 1) * MASTER}
            playbackRate={c.rate ?? 1}
            name={`sfx · ${c.sound}`}
          />
        ))}
      </AbsoluteFill>
    );
  }
  FrameDriven.displayName = `FrameDriven(${name})`;
  return FrameDriven;
}
