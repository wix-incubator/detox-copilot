import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";

export async function bundleDriverUtils(
  entryFilePath = "../utils.ts",
  outputFilePath = "../../dist/web-utils.browser.js"
): Promise<string> {
  const resolvedEntryPath = path.resolve(__dirname, entryFilePath);
  const resolvedOutputPath = path.resolve(__dirname, outputFilePath);

  try {
    const { outputFiles } = await esbuild.build({
      entryPoints: [resolvedEntryPath],
      bundle: true,
      write: false,
      format: "iife",
      target: ["chrome100"],
    });

    const [output] = outputFiles || [];

    if (!output) {
      throw new Error("Bundle generation failed: No output produced");
    }

    await fs.promises.writeFile(resolvedOutputPath, output.text, "utf8");
    return output.text;
  } catch (error) {
    console.error(`Bundling failed for ${resolvedEntryPath}:`, error);
    throw error;
  }
}