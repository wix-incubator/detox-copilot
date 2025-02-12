import * as esbuild from "esbuild";
import * as path from "path";
import fs from "fs";

export async function bundleDriverUtils(): Promise<string> {
  try {
    const result = await esbuild.build({
      entryPoints: [path.resolve(__dirname, "../manipulate.ts")],
      bundle: true,
      write: false,
      format: "iife",
      globalName: "driverUtils",
      target: ["chrome100"],
      // footer: {
      //   js: "window.driverUtils = driverUtils.default;",
      // },
    });

    if (!result.outputFiles?.[0]) {
      throw new Error("Bundle generation failed: No output produced");
    }
    const outputPath = path.resolve(
      __dirname,
      "../../dist/web-utils.browser.js",
    );
    fs.writeFileSync(outputPath, result.outputFiles[0].text, "utf8");
    return result.outputFiles[0].text;
  } catch (error) {
    console.error("Bundling failed:", error);
    throw error;
  }
}
