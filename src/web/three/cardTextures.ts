"use client";
/**
 * Rasterises the shared SVG trading cards into canvases for WebGL textures.
 * Fonts are embedded as data URIs so the card typography matches the DOM version exactly.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fontFaceCss, fontFaces, fontPath } from "@/design/fonts";
import type { Hero } from "@/heroes/types";
import { CARD_H, CARD_W, TradingCard } from "@/visual/TradingCard";

let fontCssPromise: Promise<string> | null = null;

async function toDataUri(url: string) {
  const buf = await (await fetch(url)).arrayBuffer();
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:font/woff2;base64,${btoa(bin)}`;
}

/** @font-face rules with embedded font data (fetched once). */
export function embeddedFontCss() {
  fontCssPromise ??= (async () => {
    const uris = Object.fromEntries(await Promise.all(fontFaces.map(async (f) => [f.file, await toDataUri(fontPath(f.file))] as const)));
    return fontFaceCss((file) => uris[file]);
  })();
  return fontCssPromise;
}

async function rasterize(svg: string, width: number, height: number) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type CardSide = "front" | "back" | "foil";

export async function cardCanvas(hero: Hero, side: CardSide, width: number) {
  const css = await embeddedFontCss();
  const el = createElement(TradingCard, { hero, side: side === "back" ? "back" : "front", foilMask: side === "foil", width: CARD_W });
  let markup = renderToStaticMarkup(el);
  // TradingCard already sets width; add the namespace + intrinsic height an <img> needs.
  markup = markup.replace("<svg", `<svg xmlns="http://www.w3.org/2000/svg" height="${CARD_H}"`);
  markup = markup.replace(/(<svg[^>]*>)/, `$1<defs><style>${css}</style></defs>`);
  const height = Math.round((width * CARD_H) / CARD_W);
  return rasterize(markup, width, height);
}
