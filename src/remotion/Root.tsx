import { Composition, Folder, Still } from "remotion";
import { motionPieces } from "@/sequences/registry";
import { OG_H, OG_W, OgCard } from "@/sequences/OgCard";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Vertical">
        {motionPieces.map((p) => (
          <Composition
            key={p.id}
            id={p.id}
            component={p.component}
            durationInFrames={p.durationInFrames}
            fps={p.fps}
            width={p.width}
            height={p.height}
            defaultProps={p.defaultProps}
          />
        ))}
      </Folder>
      <Folder name="Stills">
        <Still id="OgImage" component={OgCard} width={OG_W} height={OG_H} />
      </Folder>
    </>
  );
};
