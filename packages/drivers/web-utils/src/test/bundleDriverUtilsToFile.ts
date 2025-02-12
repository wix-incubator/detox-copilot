import * as path from "path";
import { bundleDriverUtils } from "./bundle";

(async () => {
  const filesToBundle = [
    {
      entry: "../driverutils/cleanStyles.ts",
      output: "../../dist/cleanStyles.bundle.js",
    },
    {
      entry: "../driverutils/extractCleanView.ts",
      output: "../../dist/extractCleanView.bundle.js",
    },
    {
      entry: "../driverutils/manipulateStyles.ts",
      output: "../../dist/manipulateStyles.bundle.js",
    },
    {
      entry: "../driverutils/markElements.ts",
      output: "../../dist/markElements.bundle.js",
    },
  ];

  for (const file of filesToBundle) {
    try {
      await bundleDriverUtils(file.entry, file.output);
    } catch (error) {
      console.error(`Failed to bundle ${file.entry}:`, error);
    }
  }
})();