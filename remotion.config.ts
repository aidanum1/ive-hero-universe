import { Config } from "@remotion/cli/config";
import { resolve } from "node:path";
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setRendererPort(3055);
Config.setStudioPort(3056);
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...config.resolve?.alias, "@": resolve("src") },
  },
}));
