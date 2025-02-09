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
  
    if (!isInjected) {
      const bundledCode: string = fs.readFileSync(bundledCodePath, "utf8");
      await page.addScriptTag({ content: bundledCode });
      console.log("Bundled script injected into the page.");
    } else {
      console.log("Bundled script already injected. Skipping injection.");
    }
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
    return await this.currentPage.evaluate(() => {
      return window.driverUtils.extractCleanViewStructure();
    });
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
              "example": "const firstButton = await page.evaluate(() => document.querySelector('[aria-pilot-category=\"button\"][aria-pilot-index=\"0\"]'));",
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
        {
          title: "Actions",
          items: [
            {
              signature: "await getCurrentPage().click(selector[, options])",
              description:
                "Simulates a mouse click on the element matched by the selector.",
              example: 'await getCurrentPage().click("#submit-button");',
              guidelines: [
                "Prefer evaluated click instead of click when possible.",
                "Waits for the element to be visible and enabled.",
                "Throws an error if the element is not found or not interactable.",
                "Avoid clicking on elements that change page state without proper synchronization.",
              ],
            },
            {
              signature:
                "await getCurrentPage().type(selector, text[, options])",
              description:
                "Types text into an element matched by the selector.",
              example: 'await getCurrentPage().type("#username", "myUser123");',
              guidelines: [
                "Prefer evaluated type instead of type when possible.",
                "Suitable for input and textarea elements.",
                "Simulates individual key presses with optional delay.",
                "Ensure the element is focusable before typing.",
              ],
            },
            {
              signature: "await getCurrentPage().focus(selector)",
              description: "Focuses on the element matched by the selector.",
              example: 'await getCurrentPage().focus("#search-input");',
              guidelines: [
                "Prefer evaluated focus instead of focus when possible.",
                "Useful before performing keyboard actions.",
                "Waits for the element to be interactable.",
              ],
            },
            {
              signature: "await getCurrentPage().select(selector, ...values)",
              description: "Selects options in a `<select>` element.",
              example:
                'await getCurrentPage().select("#country-select", "US");',
              guidelines: [
                "Prefer evaluated select instead of select when possible.",
                "Supports selecting multiple options if the `<select>` element allows it.",
                "Values correspond to the `value` attribute of `<option>` elements.",
              ],
            },
            {
              signature: "await getCurrentPage().hover(selector)",
              description: "Simulates hovering the mouse over the element.",
              example: 'await getCurrentPage().hover(".dropdown-trigger");',
              guidelines: [
                "Prefer evaluated hover instead of select when possible.",
                "Triggers hover effects such as tooltips or menus.",
                "Ensure the element is visible and within the viewport.",
              ],
            },
            {
              signature:
                "await getCurrentPage().keyboard.press(key[, options])",
              description: "Presses a key on the keyboard.",
              example: 'await getCurrentPage().keyboard.press("Enter");',
              guidelines: [
                "Useful for submitting forms or triggering keyboard shortcuts.",
                "Supports special keys like `ArrowLeft`, `Escape`, etc.",
                "Can specify a delay between keydown and keyup events.",
              ],
            },
            {
              signature: "await getCurrentPage().mouse.move(x, y[, options])",
              description: "Moves the mouse to the specified coordinates.",
              example: "await getCurrentPage().mouse.move(100, 200);",
              guidelines: [
                "Coordinates are relative to the top-left corner of the viewport.",
                "Can be used to simulate drag-and-drop operations.",
              ],
            },
            {
              signature: "await getCurrentPage().mouse.click(x, y[, options])",
              description: "Clicks at the specified coordinates.",
              example: "await getCurrentPage().mouse.click(150, 250);",
              guidelines: [
                "Bypasses element detection; use with caution.",
                "Ensure that the coordinates correspond to the intended element.",
              ],
            },
            {
              signature:
                "await getCurrentPage().uploadFile(selector, ...filePaths)",
              description: 'Uploads files to an `<input type="file">` element.',
              example:
                'await getCurrentPage().uploadFile("#file-input", "/path/to/file.png");',
              guidelines: [
                "Sets the value of the file input to the specified files.",
                "Files must be accessible on the machine running Puppeteer.",
              ],
            },
          ],
        },
        {
          title: "Assertions",
          items: [
            {
              signature: "await expect(value).toBe(expected)",
              description:
                "Asserts that a value is equal to an expected value.",
              example:
                'expect(await getCurrentPage().title()).toBe("Expected Title");',
              guidelines: [
                "Use within a testing framework like Jest or Mocha.",
                "Ensure that the assertion is meaningful and directly related to the test case.",
              ],
            },
            {
              signature: "await expect(value).toContain(substring)",
              description:
                "Asserts that a string contains a specific substring.",
              example: 'expect(responseText).toContain("Success");',
              guidelines: [
                "Useful for checking partial matches.",
                "Avoid overly generic substrings that could lead to false positives.",
              ],
            },
            {
              signature: "await expect(elementHandle).not.toBeNull()",
              description: "Asserts that an element was found.",
              example:
                'const element = await getCurrentPage().$("#result"); expect(element).not.toBeNull();',
              guidelines: [
                "Helps verify that elements exist on the page.",
                "Combine with other assertions to check properties or text content.",
              ],
            },
            {
              signature: "await expect(elementHandle).toHaveText(expectedText)",
              description:
                "Asserts that an element has the specified text content.",
              example:
                'const element = await getCurrentPage().$(".message"); const text = await getCurrentPage().evaluate(el => el.textContent, element); expect(text).toBe("Operation successful");',
              guidelines: [
                "Extract text content using `page.evaluate`.",
                "Ensure that the text is exactly matching or use partial matching methods.",
              ],
            },
            {
              signature: "await expect(elementHandle).toBeVisible()",
              description: "Asserts that an element is visible.",
              example:
                "const isVisible = await element.isIntersectingViewport(); expect(isVisible).toBe(true);",
              guidelines: [
                "Use `element.isIntersectingViewport()` to check visibility.",
                "Visibility may depend on scroll position and CSS properties.",
              ],
            },
          ],
        },
        {
          title: "Utilities",
          items: [
            {
              signature: "const title = await getCurrentPage().title()",
              description: "Retrieves the page title.",
              example: "const title = await getCurrentPage().title();",
              guidelines: [
                "Equivalent to accessing `document.title` in the browser.",
                "Useful for asserting that the correct page has loaded.",
              ],
            },
            {
              signature: "const html = await getCurrentPage().content()",
              description: "Gets the full HTML contents of the page.",
              example: "const html = await getCurrentPage().content();",
              guidelines: [
                "Includes the updated HTML after JavaScript execution.",
                "Useful for serializing the page content or scraping.",
              ],
            },
            {
              signature: "await getCurrentPage().screenshot([options])",
              description: "Captures a screenshot of the page.",
              example:
                'await getCurrentPage().screenshot({ path: "screenshot.png", fullPage: true });',
              guidelines: [
                "Options can specify `path`, `fullPage`, `clip`, `type`, etc.",
                "Useful for visual testing and debugging.",
              ],
            },
            {
              signature:
                "const cookies = await getCurrentPage().cookies([...urls])",
              description: "Retrieves cookies visible to the page.",
              example:
                'const cookies = await getCurrentPage().cookies("https://www.example.com");',
              guidelines: [
                "Returns an array of cookie objects.",
                "Useful for session management and authentication tasks.",
              ],
            },
            {
              signature: "await getCurrentPage().setCookie(...cookies)",
              description: "Sets cookies for the page.",
              example:
                'await getCurrentPage().setCookie({ name: "session", value: "abcdef123456", domain: "example.com" });',
              guidelines: [
                "Cookies must include at least `name` and `value`.",
                "Set cookies before navigating to ensure they are sent with requests.",
              ],
            },
            {
              signature:
                "await getCurrentPage().evaluate(pageFunction[, ...args])",
              description: "Executes a function in the page context.",
              example: `
                # Example 1: Get the title of the page
                const title = await getCurrentPage().evaluate(() => document.title);
                
                # Example 2: Get the text content of an element
                const text = await getCurrentPage().evaluate(el => el.textContent, document.querySelector(".message"));
                
                # Example 3: Click on an element
                await getCurrentPage().evaluate(() => document.querySelector("#submit").click());
                
                # Example 4: Type text into an input field
                await getCurrentPage().evaluate((el, text) => el.value = text, document.querySelector("#username"), "john_doe");
                `,
              guidelines: [
                "Allows access to the DOM and JavaScript environment of the page.",
                "Avoid exposing sensitive data or functions.",
                "It's recommended to use RegExp to match the text content of an element (with partial substring) and not the exact text.",
              ],
            },
            {
              signature:
                "const response = await getCurrentPage().goto(url[, options])",
              description:
                "Navigates to a URL and returns the main resource response.",
              example:
                'const response = await getCurrentPage().goto("https://www.example.com", { waitUntil: "networkidle0" });',
              guidelines: [
                "Options can specify navigation timeout and waiting conditions.",
                'Common `waitUntil` options are `"load"`, `"domcontentloaded"`, `"networkidle0"`, `"networkidle2"`.',
              ],
            },
            {
              signature:
                "await getCurrentPage().emulate(puppeteer.devices[deviceName])",
              description: "Emulates a device's user agent and viewport.",
              example:
                'await getCurrentPage().emulate(puppeteer.devices["iPhone X"]);',
              guidelines: [
                "Simulates mobile devices, including touch events.",
                "Useful for testing responsive design and mobile-specific behavior.",
              ],
            },
            {
              signature: "await getCurrentPage().setViewport(viewport)",
              description: "Sets the viewport size and device scale factor.",
              example:
                "await getCurrentPage().setViewport({ width: 1280, height: 800 });",
              guidelines: [
                "Viewport emulates the visible area of the page.",
                "Does not affect the window size in headful mode.",
              ],
            },
            {
              signature: "await getCurrentPage().setUserAgent(userAgent)",
              description: "Overrides the default user agent string.",
              example:
                'await getCurrentPage().setUserAgent("MyCustomUserAgent/1.0");',
              guidelines: [
                "Affects the value of `navigator.userAgent`.",
                "Useful for simulating different browsers or bots.",
              ],
            },
          ],
        },
        {
          title: "Snapshot and View Hierarchy",
          items: [
            {
              signature: "await getCurrentPage().screenshot([options])",
              description:
                "Captures a screenshot of the page or a portion of it.",
              example:
                'await getCurrentPage().screenshot({ path: "page_snapshot.png" });',
              guidelines: [
                "Use this to capture the current state of the page visually.",
                "Can specify `fullPage` to capture the entire scrollable area.",
              ],
            },
            {
              signature: "await getCurrentPage().content()",
              description: "Retrieves the current HTML content of the page.",
              example:
                "const viewHierarchy = await getCurrentPage().content();",
              guidelines: [
                "Use this to get the DOM structure as a string.",
                "Helpful for debugging or verifying the page structure.",
              ],
            },
          ],
        },
      ],
    };
  }
}
