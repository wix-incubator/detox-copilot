import {
  TestingFrameworkAPICatalog,
  TestingFrameworkDriver,
} from "@wix-pilot/core";
import * as puppeteer from "puppeteer-core";
import WebTestingFrameworkDriverHelper from "@wix-pilot/web-utils";

export class PuppeteerFrameworkDriver implements TestingFrameworkDriver {
  private executablePath?: string;
  private driverUtils: WebTestingFrameworkDriverHelper;

  constructor(executablePath?: string) {
    this.executablePath = executablePath;
    this.driverUtils = new WebTestingFrameworkDriverHelper();
  }

  /**
   * Gets the current page identifier
   */
  getCurrentPage(): puppeteer.Page | undefined {
    return this.driverUtils.getCurrentPage() as puppeteer.Page | undefined;
  }

  /**
   * Sets the current page identifier, must be set if the driver needs to interact with a specific page
   */
  setCurrentPage(page: puppeteer.Page): void {
    this.driverUtils.setCurrentPage(page);
  }

  /**
   * @inheritdoc
   */
  async captureSnapshotImage(): Promise<string | undefined> {
    return await this.driverUtils.captureSnapshotImage();
  }

  /**
   * @inheritdoc
   */
  async captureViewHierarchyString(): Promise<string> {
    return await this.driverUtils.captureViewHierarchyString();
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
              signature: "getCurrentPage().setUserAgent(userAgent)",
              description: "Overrides the default user agent string.",
              example: 'getCurrentPage().setUserAgent("UA-TEST");',
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
              signature: "const page = getCurrentPage()",
              description:
                "Gets the current page instance. Can return `undefined` if no page is set.",
              example: "const page = getCurrentPage();",
            },
            {
              signature: "setCurrentPage(page)",
              description:
                "Sets the current page instance for the driver to interact with (required if setting a new page).",
              example: "setCurrentPage(page);",
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
