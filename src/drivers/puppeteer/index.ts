import { TestingFrameworkAPICatalog, TestingFrameworkDriver } from "@/types";
import puppeteer, { Page } from "puppeteer";
import path from "path";

export class PuppeteerFrameworkDriver implements TestingFrameworkDriver {
  private currentPage?: Page;

  /**
   * Gets the current page identifier
   */
  getCurrentPage(): Page | undefined {
    return this.currentPage;
  }

  /**
   * Sets the current page identifier, must be set if the driver needs to interact with a specific page
   */
  setCurrentPage(page: Page): void {
    this.currentPage = page;
  }

  /**
   * @inheritdoc
   */
  async captureSnapshotImage(): Promise<string | undefined> {
    if (!this.currentPage) {
      return undefined;
    }

    const fileName = `temp/snapshot_puppeteer_${Date.now()}.png`;

    await this.currentPage.screenshot({
      path: fileName,
      fullPage: false,
    });

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

    return await this.currentPage.content();
  }

  /**
   * @inheritdoc
   */
  get apiCatalog(): TestingFrameworkAPICatalog {
    return {
      name: "Puppeteer",
      description:
        "Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol.",
      context: {
        getCurrentPage: this.getCurrentPage,
        setCurrentPage: this.setCurrentPage,
        puppeteer,
      },
      categories: [
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
              signature: "await page.$(selector)",
              description: "Finds the first element matching the selector.",
              example: 'const element = await page.$("#login-button");',
              guidelines: [
                "Returns an ElementHandle if the element is found, otherwise `null`.",
                "Use CSS selectors to locate elements.",
                "Avoid using overly broad selectors; prefer IDs or class names when available.",
              ],
            },
            {
              signature: "await page.$$(selector)",
              description: "Finds all elements matching the selector.",
              example: 'const elements = await page.$$(".list-item");',
              guidelines: [
                "Returns an array of ElementHandles.",
                "Use this when you need to interact with multiple elements.",
              ],
            },
            {
              signature: "await page.$x(xpath)",
              description: "Finds elements matching the XPath expression.",
              example:
                "const elements = await page.$x(\"//button[text()='Submit']\");",
              guidelines: [
                "Use XPath selectors when CSS selectors are insufficient.",
                "Avoid using XPath if CSS selectors can achieve the same result.",
              ],
            },
            {
              signature: "await page.waitForSelector(selector[, options])",
              description:
                "Waits for an element matching the selector to appear in the DOM.",
              example:
                'await page.waitForSelector(".loading-indicator", { visible: true });',
              guidelines: [
                "Useful for synchronization before interacting with elements.",
                "Options can specify visibility (`visible`, `hidden`), and timeout.",
              ],
            },
            {
              signature: "await page.waitForXPath(xpath[, options])",
              description:
                "Waits for an element matching the XPath expression to appear.",
              example: "await page.waitForXPath(\"//div[@class='content']\");",
              guidelines: [
                "Use when XPath is necessary to locate elements.",
                "Similar to `waitForSelector` but using XPath expressions.",
              ],
            },
            {
              signature:
                "await page.waitForFunction(pageFunction[, options][, ...args])",
              description:
                "Waits for a function to evaluate to a truthy value.",
              example:
                'await page.waitForFunction(() => document.querySelector("#status").innerText === "Loaded");',
              guidelines: [
                "Useful for waiting on dynamic content or conditions.",
                "Avoid tight polling intervals to prevent excessive CPU usage.",
              ],
            },
            {
              signature: "await page.waitForTimeout(milliseconds)",
              description: "Pauses execution for a specified amount of time.",
              example:
                "await page.waitForTimeout(2000); // Waits for 2 seconds",
              guidelines: [
                "Use sparingly; prefer event-based waiting when possible.",
                "Can be useful for simulating user think time or for debugging.",
              ],
            },
          ],
        },
        {
          title: "Actions",
          items: [
            {
              signature: "await page.click(selector[, options])",
              description:
                "Simulates a mouse click on the element matched by the selector.",
              example: 'await page.click("#submit-button");',
              guidelines: [
                "Waits for the element to be visible and enabled.",
                "Throws an error if the element is not found or not interactable.",
                "Avoid clicking on elements that change page state without proper synchronization.",
              ],
            },
            {
              signature: "await page.type(selector, text[, options])",
              description:
                "Types text into an element matched by the selector.",
              example: 'await page.type("#username", "myUser123");',
              guidelines: [
                "Suitable for input and textarea elements.",
                "Simulates individual key presses with optional delay.",
                "Ensure the element is focusable before typing.",
              ],
            },
            {
              signature: "await page.focus(selector)",
              description: "Focuses on the element matched by the selector.",
              example: 'await page.focus("#search-input");',
              guidelines: [
                "Useful before performing keyboard actions.",
                "Waits for the element to be interactable.",
              ],
            },
            {
              signature: "await page.select(selector, ...values)",
              description: "Selects options in a `<select>` element.",
              example: 'await page.select("#country-select", "US");',
              guidelines: [
                "Supports selecting multiple options if the `<select>` element allows it.",
                "Values correspond to the `value` attribute of `<option>` elements.",
              ],
            },
            {
              signature: "await page.hover(selector)",
              description: "Simulates hovering the mouse over the element.",
              example: 'await page.hover(".dropdown-trigger");',
              guidelines: [
                "Triggers hover effects such as tooltips or menus.",
                "Ensure the element is visible and within the viewport.",
              ],
            },
            {
              signature: "await page.keyboard.press(key[, options])",
              description: "Presses a key on the keyboard.",
              example: 'await page.keyboard.press("Enter");',
              guidelines: [
                "Useful for submitting forms or triggering keyboard shortcuts.",
                "Supports special keys like `ArrowLeft`, `Escape`, etc.",
                "Can specify a delay between keydown and keyup events.",
              ],
            },
            {
              signature: "await page.mouse.move(x, y[, options])",
              description: "Moves the mouse to the specified coordinates.",
              example: "await page.mouse.move(100, 200);",
              guidelines: [
                "Coordinates are relative to the top-left corner of the viewport.",
                "Can be used to simulate drag-and-drop operations.",
              ],
            },
            {
              signature: "await page.mouse.click(x, y[, options])",
              description: "Clicks at the specified coordinates.",
              example: "await page.mouse.click(150, 250);",
              guidelines: [
                "Bypasses element detection; use with caution.",
                "Ensure that the coordinates correspond to the intended element.",
              ],
            },
            {
              signature: "await page.uploadFile(selector, ...filePaths)",
              description: 'Uploads files to an `<input type="file">` element.',
              example:
                'await page.uploadFile("#file-input", "/path/to/file.png");',
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
              example: 'expect(await page.title()).toBe("Expected Title");',
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
                'const element = await page.$("#result"); expect(element).not.toBeNull();',
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
                'const element = await page.$(".message"); const text = await page.evaluate(el => el.textContent, element); expect(text).toBe("Operation successful");',
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
              signature: "const title = await page.title()",
              description: "Retrieves the page title.",
              example: "const title = await page.title();",
              guidelines: [
                "Equivalent to accessing `document.title` in the browser.",
                "Useful for asserting that the correct page has loaded.",
              ],
            },
            {
              signature: "const html = await page.content()",
              description: "Gets the full HTML contents of the page.",
              example: "const html = await page.content();",
              guidelines: [
                "Includes the updated HTML after JavaScript execution.",
                "Useful for serializing the page content or scraping.",
              ],
            },
            {
              signature: "await page.screenshot([options])",
              description: "Captures a screenshot of the page.",
              example:
                'await page.screenshot({ path: "screenshot.png", fullPage: true });',
              guidelines: [
                "Options can specify `path`, `fullPage`, `clip`, `type`, etc.",
                "Useful for visual testing and debugging.",
              ],
            },
            {
              signature: "const cookies = await page.cookies([...urls])",
              description: "Retrieves cookies visible to the page.",
              example:
                'const cookies = await page.cookies("https://www.example.com");',
              guidelines: [
                "Returns an array of cookie objects.",
                "Useful for session management and authentication tasks.",
              ],
            },
            {
              signature: "await page.setCookie(...cookies)",
              description: "Sets cookies for the page.",
              example:
                'await page.setCookie({ name: "session", value: "abcdef123456", domain: "example.com" });',
              guidelines: [
                "Cookies must include at least `name` and `value`.",
                "Set cookies before navigating to ensure they are sent with requests.",
              ],
            },
            {
              signature: "await page.evaluate(pageFunction[, ...args])",
              description: "Executes a function in the page context.",
              example:
                "const dimensions = await page.evaluate(() => { return { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }; });",
              guidelines: [
                "Allows access to the DOM and JavaScript environment of the page.",
                "Avoid exposing sensitive data or functions.",
              ],
            },
            {
              signature: "const response = await page.goto(url[, options])",
              description:
                "Navigates to a URL and returns the main resource response.",
              example:
                'const response = await page.goto("https://www.example.com", { waitUntil: "networkidle0" });',
              guidelines: [
                "Options can specify navigation timeout and waiting conditions.",
                'Common `waitUntil` options are `"load"`, `"domcontentloaded"`, `"networkidle0"`, `"networkidle2"`.',
              ],
            },
            {
              signature: "await page.emulate(puppeteer.devices[deviceName])",
              description: "Emulates a device's user agent and viewport.",
              example: 'await page.emulate(puppeteer.devices["iPhone X"]);',
              guidelines: [
                "Simulates mobile devices, including touch events.",
                "Useful for testing responsive design and mobile-specific behavior.",
              ],
            },
            {
              signature: "await page.setViewport(viewport)",
              description: "Sets the viewport size and device scale factor.",
              example: "await page.setViewport({ width: 1280, height: 800 });",
              guidelines: [
                "Viewport emulates the visible area of the page.",
                "Does not affect the window size in headful mode.",
              ],
            },
            {
              signature: "await page.setUserAgent(userAgent)",
              description: "Overrides the default user agent string.",
              example: 'await page.setUserAgent("MyCustomUserAgent/1.0");',
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
              signature: "await page.screenshot([options])",
              description:
                "Captures a screenshot of the page or a portion of it.",
              example: 'await page.screenshot({ path: "page_snapshot.png" });',
              guidelines: [
                "Use this to capture the current state of the page visually.",
                "Can specify `fullPage` to capture the entire scrollable area.",
              ],
            },
            {
              signature: "await page.content()",
              description: "Retrieves the current HTML content of the page.",
              example: "const viewHierarchy = await page.content();",
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
