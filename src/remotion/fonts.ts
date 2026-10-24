// Loads the shared font manifest inside Remotion (blocks rendering until ready).
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { fontFaces } from "@/design/fonts";

export const fontsReady = Promise.all(
  fontFaces.map((f) =>
    loadFont({
      family: f.family,
      url: staticFile(`fonts/${f.file}`),
      weight: f.weight,
      style: f.style,
      stretch: f.stretch,
      unicodeRange: f.unicodeRange,
      format: "woff2",
      display: "block",
    }),
  ),
);
