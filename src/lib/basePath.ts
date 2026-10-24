/**
 * Deploy sub-path (e.g. "/ive-hero-universe" on GitHub Pages). Inlined by Next at build
 * time; empty in dev and inside the Remotion bundle.
 */
export const BASE_PATH: string = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_PATH) || "";

/** Prefix a root-relative path ("/fonts/x.woff2") with the deploy sub-path. */
export const withBase = (path: string) => (path.startsWith("/") ? `${BASE_PATH}${path}` : path);
