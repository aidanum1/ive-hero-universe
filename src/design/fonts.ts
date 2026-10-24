import { withBase } from "@/lib/basePath";

/**
 * Font manifest — the single source for @font-face on the web (see app/layout.tsx),
 * for Remotion (see remotion/fonts.ts) and for SVG→WebGL texture rasterising.
 * Files are downloaded by scripts/fetch-fonts.mjs into /public/fonts.
 */

export type FontFace = {
  family: string;
  file: string;
  weight: string;
  style: "normal" | "italic";
  stretch?: string;
  unicodeRange?: string;
};

const CJK = "U+3000-30FF, U+31F0-31FF, U+4E00-9FFF, U+FF00-FFEF";

export const fontFaces: FontFace[] = [
  { family: "IVE Display", file: "display.woff2", weight: "400", style: "normal" },
  { family: "IVE Display", file: "display-jp.woff2", weight: "400", style: "normal", unicodeRange: CJK },
  { family: "IVE Wide", file: "wide.woff2", weight: "100 900", style: "normal", stretch: "62% 125%" },
  { family: "IVE Serif", file: "serif.woff2", weight: "400 900", style: "normal" },
  { family: "IVE Serif", file: "serif-italic.woff2", weight: "400 900", style: "italic" },
  { family: "IVE Pixel", file: "pixel.woff2", weight: "400", style: "normal" },
  { family: "IVE Pixel", file: "pixel-jp.woff2", weight: "400", style: "normal", unicodeRange: CJK },
  { family: "IVE Hangul", file: "hangul.woff2", weight: "400", style: "normal" },
  { family: "IVE Hangul Text", file: "hangul-text.woff2", weight: "400 900", style: "normal" },
];

export const fontPath = (file: string) => withBase(`/fonts/${file}`);

/** Generates @font-face CSS. `resolve` maps a file name to a URL (web vs. Remotion vs. data URI). */
export const fontFaceCss = (resolve: (file: string) => string = fontPath) =>
  fontFaces
    .map(
      (f) =>
        `@font-face{font-family:'${f.family}';src:url('${resolve(f.file)}') format('woff2');` +
        `font-weight:${f.weight};font-style:${f.style};font-display:block;` +
        (f.stretch ? `font-stretch:${f.stretch};` : "") +
        (f.unicodeRange ? `unicode-range:${f.unicodeRange};` : "") +
        "}",
    )
    .join("\n");
