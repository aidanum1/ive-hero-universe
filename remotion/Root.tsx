import { Composition } from "remotion";
import { CaptainPurpleIntro } from "./compositions/CaptainPurpleIntro";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="CaptainPurpleIntro"
        component={CaptainPurpleIntro}
        durationInFrames={1260}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CaptainPurpleIntroLandscape"
        component={CaptainPurpleIntro}
        durationInFrames={1260}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
}
