import * as esbuild from "esbuild";
import * as path from "path";

export async function bundleDriverUtils(): Promise<string> {
  try {
    const result = await esbuild.build({
      entryPoints: [path.resolve(__dirname, "../index.ts")],
      bundle: true,
      write: false,
      format: "iife",
      globalName: "driverUtils",
      target: ["chrome100"],
      footer: {
        js: "window.driverUtils = driverUtils.default;",
      },
    });

    if (!result.outputFiles?.[0]) {
      throw new Error("Bundle generation failed: No output produced");
    }

    return result.outputFiles[0].text;
  } catch (error) {
    console.error("Bundling failed:", error);
    throw error;
  }
} 
