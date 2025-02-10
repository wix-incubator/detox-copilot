import fs from "fs";
import path from "path";
import { bundleDriverUtils } from "./bundle";

async function createBundledDriverUtilsFile(): Promise<void> {
  try {
    const bundleText = await bundleDriverUtils();

    const outputPath = path.resolve(
      __dirname,
      "../../dist/web-utils.browser.js",
    );
    fs.writeFileSync(outputPath, bundleText, "utf8");
  } catch (error) {
    console.error("Failed to create bundled driver utils file:", error);
    throw error;
  }
}

createBundledDriverUtilsFile();
