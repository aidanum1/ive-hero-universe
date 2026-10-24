import type { Metadata, Viewport } from "next";
import { rootCssVars } from "@/design/cssVars";
import { fontFaceCss, fontFaces, fontPath } from "@/design/fonts";
import { color } from "@/design/tokens";
import { disclaimer } from "@/content/release";
import { owner } from "@/content/project";
import { withBase } from "@/lib/basePath";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: { images: [{ url: withBase("/og.png"), width: 1200, height: 630, alt: "IVE HERO UNIVERSE — unofficial fan-made project" }] },
  twitter: { card: "summary_large_image", images: [withBase("/og.png")], creator: owner.handle },
  authors: [{ name: owner.handle, url: owner.url }],
  creator: owner.handle,
  title: "IVE HERO UNIVERSE — an unofficial fan-made universe",
  description:
    "An unofficial, fan-made interactive motion universe inspired by IVE's GIRL HERO / Looks Can Kill era. Six heroes, one universe. " +
    disclaimer.short,
};

export const viewport: Viewport = {
  themeColor: color.ink,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const preload = [...new Set(fontFaces.filter((f) => !f.unicodeRange).map((f) => f.file))];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        {preload.map((file) => (
          <link key={file} rel="preload" href={fontPath(file)} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <style dangerouslySetInnerHTML={{ __html: `${fontFaceCss()}\n${rootCssVars()}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
