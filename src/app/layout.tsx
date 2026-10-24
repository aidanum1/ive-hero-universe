import type { Metadata, Viewport } from "next";
import "@fontsource/anton/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./globals.css";
import { assetUrl } from "@/utils/assets";

export const metadata: Metadata = {
  title: "IVE HERO UNIVERSE — Break the Frame",
  description:
    "Six signals. One universe. An unofficial, interactive superhero comic experiment. Enter the page and awaken Captain Purple.",
  icons: { icon: assetUrl("/icon.svg") },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101014",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
