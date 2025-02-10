import {
  TestingFrameworkAPICatalog,
  TestingFrameworkDriver,
} from "@wix-pilot/core";
import * as puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";
import utils from "@wix-pilot/web-utils";
const bundledCodePath = require.resolve(
  "@wix-pilot/web-utils/dist/web-utils.browser.js",
);
declare global {
  interface Window {
    driverUtils: typeof utils;
  }
}

export class PuppeteerFrameworkDriver implements TestingFrameworkDriver {
  private currentPage?: puppeteer.Page;
  private executablePath?: string;

  constructor(executablePath?: string) {
    this.getCurrentPage = this.getCurrentPage.bind(this);
    this.setCurrentPage = this.setCurrentPage.bind(this);
    this.executablePath = executablePath;
  }

  /**
   * Gets the current page identifier
   */
  getCurrentPage(): puppeteer.Page | undefined {
    return this.currentPage;
  }

  /**
   * Sets the current page identifier, must be set if the driver needs to interact with a specific page
   */
  async setCurrentPage(page: puppeteer.Page): Promise<void> {
    this.currentPage = page;
  }

  /**
   * Injects bundeled code to page and marks important elements in the DOM
   */
  async injectCodeAndMarkElements(page: puppeteer.Page): Promise<void> {
    const isInjected = await page.evaluate(
      () => typeof window.driverUtils?.markImportantElements === "function",
    );

    if (!isInjected) {
      await page.addScriptTag({
        content: fs.readFileSync(bundledCodePath, "utf8"),
      });
      console.log("Bundled script injected into the page.");
    } else {
      console.log("Bundled script already injected. Skipping injection.");
    }

    await page.evaluate(() => window.driverUtils.markImportantElements());
  }

  /**
   * Mark the elements and separates them to categories
   */
  async manipulateStyles(page: puppeteer.Page): Promise<void> {
    await page.evaluate(() => {
      window.driverUtils.manipulateElementStyles();
    });
  }

  /**
   * Clean up page style changes
   */
  async cleanUpStyleChanges(page: puppeteer.Page): Promise<void> {
    await page.evaluate(() => {
      window.driverUtils.cleanupStyleChanges();
    });
  }

  /**
   * @inheritdoc
   */
  async captureSnapshotImage(): Promise<string | undefined> {
    if (!this.currentPage) {
      return undefined;
    }

    const fileName = `temp/snapshot_puppeteer_${Date.now()}.png`;

    // create temp directory if it doesn't exist
    if (!fs.existsSync("temp")) {
      fs.mkdirSync("temp");
    }

    await this.injectCodeAndMarkElements(this.currentPage);
    await this.manipulateStyles(this.currentPage);
    await this.currentPage.screenshot({
      path: fileName,
      fullPage: true,
    });
    await this.cleanUpStyleChanges(this.currentPage);
    return path.resolve(fileName);
  }

  /**
   * @inheritdoc
   */
  async captureViewHierarchyString(): Promise<string> {
    if (!this.currentPage) {
      return (
        "CANNOT SEE ANY ACTIVE PAGE, " +
        "START A NEW ONE BASED ON THE ACTION NEED OR RAISE AN ERROR"
      );
    }
    await this.injectCodeAndMarkElements(this.currentPage);
    const clear_view = await this.currentPage.evaluate(() => {
      return window.driverUtils.extractCleanViewStructure();
    });
    return clear_view;
  }

  /**
   * @inheritdoc
   */
  get apiCatalog(): TestingFrameworkAPICatalog {
    return {
      name: "Puppeteer",
      description:
        "Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol.\nYou can assume that puppeteer is already imported (as `puppeteer`).",
      context: {
        getCurrentPage: this.getCurrentPage,
        setCurrentPage: this.setCurrentPage,
        puppeteer,
      },
      categories: [
        {
          title: "Browser",
          items: [
            {
              signature: "const browser = await puppeteer.launch([options])",
              description: "Launches a new browser instance.",
              example: `const browser = await puppeteer.launch({\`headless: "false"\`, executablePath: "${this.executablePath}" });`,
              guidelines: [
                `Executable path is required always, use the path: ${this.executablePath}`,
                "Options can specify `headless`, `slowMo`, `args`, etc.",
                "Useful for running tests in a headless browser environment.",
                'Prefer passing `headless: "new"` to `puppeteer.launch() unless mentioned that ' +
                  "it is required not to (e.g. launching with GUI was mentioned).",
              ],
            },
            {
              signature: "await browser.close()",
              description: "Closes the browser instance.",
              example: "await getCurrentPage().browser().close();",
              guidelines: [
                "Allows to close the browser after finishing a test flow.",
                "Useful for cleaning up resources and freeing memory.",
              ],
            },
            {
              signature: "await getCurrentPage().setUserAgent(userAgent)",
              description: "Overrides the default user agent string.",
              example: 'await getCurrentPage().setUserAgent("UA-TEST");',
              guidelines: [
                "Affects the value of `navigator.userAgent`.",
                "Useful for simulating different browsers or bots.",
              ],
            },
          ],
        },
        {
          title: "Current page management",
          items: [
            {
              signature: "const page = await getCurrentPage()",
              description:
                "Gets the current page instance. Can return `undefined` if no page is set.",
              example: "const page = await getCurrentPage();",
            },
            {
              signature: "await setCurrentPage(page)",
              description:
                "Sets the current page instance for the driver to interact with (required if setting a new page).",
              example: "await setCurrentPage(page);",
            },
          ],
        },
        {
          title: "Matchers",
          items: [
            {
              signature:
                'document.querySelector(\'[aria-pilot-category="categoryName"][aria-pilot-index="index"]\')',
              description:
                "Selects a specific element within a category based on its index.",
              example: `const firstButton = await page.evaluate(() => document.querySelector('[aria-pilot-category="button"][aria-pilot-index="27"]');`,
              guidelines: [
                "Replace `categoryName` with the desired category and `index` with the specific index as a string.",
                "Indexing is zero-based and increments per category as elements are found.",
                "Use this to interact with or verify a specific instance of a category, ensuring the exact element is targeted.",
              ],
            },
          ],
        },
      ],
    };
  }
}
