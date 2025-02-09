import {
  TestingFrameworkAPICatalog,
  TestingFrameworkDriver,
} from "@wix-pilot/core";
import * as puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";
import utils from "@wix-pilot/web-utils";
const bundledCodePath = require.resolve("@wix-pilot/web-utils/dist/web-utils.browser.js");
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
   * Injects bundeled code to page
   */
  async injectJsToPage(page: puppeteer.Page): Promise<void> {
    const isInjected = await page.evaluate(() => {
      return typeof window.driverUtils?.markImportantElements === "function";
    });
  
    if (isInjected) {
      console.log("Bundled script already injected. Skipping injection.");
      return;
    }

    const bundledCode: string = fs.readFileSync(bundledCodePath, "utf8");
    await page.addScriptTag({ content: bundledCode });
    console.log("Bundled script injected into the page.");
  }
  
  /**
   * Mark the elements and separates them to categories
   */
  async markElements(page: puppeteer.Page): Promise<void> {
    await page.evaluate(() => {
      window.driverUtils.markImportantElements();
    });
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
    
    await this.injectJsToPage(this.currentPage);
    await this.markElements(this.currentPage);
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
    await this.injectJsToPage(this.currentPage);
    await this.markElements(this.currentPage);
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
              example:
                `const browser = await puppeteer.launch({\`headless: "false"\`, executablePath: "${this.executablePath}" });`,
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
              "signature": "document.querySelectorAll('[aria-pilot-category]')",
              "description": "Selects all elements that have been marked with an `aria-pilot-category` attribute.",
              "example": "const markedElements = await page.evaluate(() => Array.from(document.querySelectorAll('[aria-pilot-category]')).map(el => el.tagName.toLowerCase()));",
              "guidelines": [
                "Use this selector to retrieve all elements that have been categorized by `markImportantElements`.",
                "Helpful for verifying that elements have been properly marked and for further interactions."
              ]
            },
            {
              "signature": "document.querySelectorAll('[aria-pilot-category=\"categoryName\"]')",
              "description": "Selects all elements marked with a specific `aria-pilot-category`.",
              "example": "const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('[aria-pilot-category=\"button\"]')).map(el => el.textContent.trim()));",
              "guidelines": [
                "Replace `categoryName` with the desired category (e.g., `button`, `link`, `input`, `list`, `table`, `header`, `semantic`).",
                "Use this to target and verify elements of a specific category."
              ]
            },
            {
              "signature": "document.querySelector('[aria-pilot-category=\"categoryName\"][aria-pilot-index=\"index\"]')",
              "description": "Selects a specific element within a category based on its index.",
              "example": `const firstButton = await page.evaluate(() => const acceptAllButton = document.querySelector('[aria-pilot-category="button"][aria-pilot-index="27"]');`,
              "guidelines": [
                "Replace `categoryName` with the desired category and `index` with the specific index as a string.",
                "Indexing is zero-based and increments per category as elements are found.",
                "Use this to interact with or verify a specific instance of a category, ensuring the exact element is targeted."
              ]
            },
            {
              "signature": "element.hasAttribute('aria-pilot-category')",
              "description": "Checks if an element has been marked with an `aria-pilot-category` attribute.",
              "example": "const isMarked = await page.evaluate(() => document.querySelector('nav').hasAttribute('aria-pilot-category'));",
              "guidelines": [
                "Useful for asserting whether specific elements have been processed by `markImportantElements`.",
                "Can be combined with other conditions to validate the markup."
              ]
            },
            {
              "signature": "await page.evaluate(() => window.isElementHidden(element))",
              "description": "Evaluates whether an element is hidden in the DOM.",
              "example": "const isHidden = await page.evaluate(() => window.isElementHidden(document.querySelector('#hidden-element')));",
              "guidelines": [
                "Helps determine if elements are visible or should be included when marking elements.",
                "Used internally by `markImportantElements` unless `includeHidden` is set to `true`."
              ]
            },
            {
              "signature": "await page.evaluate(() => { /* assertions on form elements */ })",
              "description": "Evaluates and extracts information from form elements to test their structure and attributes.",
              "example": "const formElements = await page.evaluate(() => { const inputs = document.querySelectorAll('form input[aria-pilot-category=\"input\"]'); return Array.from(inputs).map(input => input.placeholder); });",
              "guidelines": [
                "Use to verify that form elements are correctly marked and contain the expected attributes.",
                "Can be extended to check various types of input fields and buttons within forms."
              ]
            }
          ],
        },
      ],
    };
  }
}
