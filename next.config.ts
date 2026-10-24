import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 builds a fully static site into /out (GitHub Pages).
 * PAGES_BASE_PATH is the repo sub-path, e.g. "/ive-hero-universe" (set by the deploy workflow).
 */
const isExport = process.env.STATIC_EXPORT === "1";
const basePath = isExport ? (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "") : "";

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(isExport
    ? {
        output: "export",
        basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: process.env.SITE_URL ?? "http://localhost:3000",
  },
};

export default nextConfig;
