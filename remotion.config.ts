// Remotion CLI / Studio config. Shares the Next.js source tree through the "@" alias.
import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/remotion/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setConcurrency(4);
// Keep clear of the Next.js dev server on :3000.
Config.setStudioPort(3100);
Config.setRendererPort(3200);
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      "@": path.join(process.cwd(), "src"),
    },
  },
}));
