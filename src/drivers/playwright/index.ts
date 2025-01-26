import { TestingFrameworkAPICatalog, TestingFrameworkDriver } from "@/types";
import * as playwright from "playwright";
import { expect as playwrightExpect } from "@playwright/test";
import path from "path";
import fs from "fs";
import getCleanDOM from "./getCleanDOM";

export class PlaywrightFrameworkDriver implements TestingFrameworkDriver {
  private currentPage?: playwright.Page;

  constructor() {
    this.getCurrentPage = this.getCurrentPage.bind(this);
    this.setCurrentPage = this.setCurrentPage.bind(this);
  }

  /**
   * Gets the current page identifier
   */
  getCurrentPage(): playwright.Page | undefined {
    return this.currentPage;
  }

  /**
   * Sets the current page identifier, must be set if the driver needs to interact with a specific page
   */
  setCurrentPage(page: playwright.Page): void {
    this.currentPage = page;
  }

  /**
   * @inheritdoc
   */
  async captureSnapshotImage(): Promise<string | undefined> {
    if (!this.currentPage) {
      return undefined;
    }

    const fileName = `temp/snapshot_playwright_${Date.now()}.png`;

    // create temp directory if it doesn't exist
    if (!fs.existsSync("temp")) {
      fs.mkdirSync("temp");
    }

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

    try {
      return await getCleanDOM(this.currentPage);
    } catch {
      return "NO INNER VIEW HIERARCHY FOUND, PAGE IS EMPTY OR NOT LOADED";
    }
  }

  /**
   * @inheritdoc
   */
  get apiCatalog(): TestingFrameworkAPICatalog {
    return {
      name: "Playwright",
      description:
        "Playwright is a Node library which provides a high-level API to control browsers over the DevTools Protocol.\nYou can assume that playwright and playwrightExpect are already imported.",
      context: {
        getCurrentPage: this.getCurrentPage,
        setCurrentPage: this.setCurrentPage,
        playwright,
        expect: playwrightExpect,
      },
      categories: [
        {
          title: "Page Management",
          items: [
            {
              signature: "getCurrentPage(): playwright.Page | undefined",
              description: "Gets the current active page instance.",
              example: "const page = getCurrentPage();",
              guidelines: [
                "Always check if page exists before operations.",
                "Returns undefined if no page is set.",
                "Use before any page interactions.",
              ],
            },
            {
              signature: "setCurrentPage(page: playwright.Page): void",
              description: "Sets the current active page for interactions.",
              example:
                "const page = await context.newPage(); setCurrentPage(page);",
              guidelines: [
                "Must be called after creating a new page.",
                "Required before any page interactions.",
                "Only one page can be active at a time.",
              ],
            },
          ],
        },
        {
          title: "Browser and Context Setup",
          items: [
            {
              signature:
                "const browser = await playwright.chromium.launch([options])",
              description: "Launches a new browser instance.",
              example: `const browser = await playwright.chromium.launch({ 
  headless: false,
  timeout: 30000  // Default timeout for all operations
});
const context = await browser.newContext();
const page = await context.newPage();
setCurrentPage(page);`,
              guidelines: [
                "Set longer timeouts (30s or more) to handle slow operations.",
                "Can use chromium, firefox, or webkit browsers.",
                "Remember to call setCurrentPage after creating a page.",
              ],
            },
            {
              signature: "const context = await browser.newContext([options])",
              description:
                "Creates a new browser context (like an incognito window).",
              example: `const context = await browser.newContext({ 
  viewport: { width: 1280, height: 720 },
  navigationTimeout: 30000,  // Navigation specific timeout
  actionTimeout: 15000      // Action specific timeout
});
const page = await context.newPage();
setCurrentPage(page);`,
              guidelines: [
                "Each context is isolated with separate cookies/localStorage.",
                "Set specific timeouts for different operation types.",
                "Configure viewport and other browser settings here.",
              ],
            },
          ],
        },
        {
          title: "Navigation",
          items: [
            {
              signature: "await page.goto(url[, options])",
              description: "Navigates to a URL.",
              example: `const page = getCurrentPage();
if (page) {
  await page.goto('https://example.com');
  // Verify navigation success using assertions
  await expect(page.getByRole('heading')).toBeVisible();
}`,
              guidelines: [
                "Always verify navigation success with assertions.",
                "Avoid using waitUntil options - use assertions instead.",
                "Set proper timeouts at browser/context level.",
              ],
            },
            {
              signature: "await page.reload()",
              description: "Reloads the current page.",
              example: `const page = getCurrentPage();
if (page) {
  await page.reload();
  // Verify reload success using assertions
  await expect(page.getByRole('main')).toBeVisible();
}`,
              guidelines: [
                "Use assertions to verify page state after reload.",
                "Avoid explicit waits - let assertions handle timing.",
                "Good for refreshing stale content.",
              ],
            },
          ],
        },
        {
          title: "Locators",
          items: [
            {
              signature: "page.getByRole(role[, options])",
              description: "Locates elements by ARIA role or HTML tag.",
              example: `const page = getCurrentPage();
if (page) {
  await page.getByRole('button', { name: 'Submit' }).click();
}`,
              guidelines: [
                "Always check if page exists first.",
                "Preferred way to locate interactive elements.",
                "Improves test accessibility coverage.",
              ],
            },
            {
              signature: "page.getByText(text[, options])",
              description: "Locates elements by their text content.",
              example: `const page = getCurrentPage();
if (page) {
  await page.getByText('Welcome').isVisible();
}`,
              guidelines: [
                "Always check if page exists first.",
                "Good for finding visible text on page.",
                "Can use exact or fuzzy matching.",
              ],
            },
            {
              signature: "page.getByLabel(text)",
              description: "Locates form control by associated label.",
              example: `const page = getCurrentPage();
if (page) {
  await page.getByLabel('Username').fill('john');
}`,
              guidelines: [
                "Always check if page exists first.",
                "Best practice for form inputs.",
                "More reliable than selectors.",
              ],
            },
          ],
        },
        {
          title: "Actions",
          items: [
            {
              signature: "await locator.click([options])",
              description: "Clicks on the element.",
              example: `const page = getCurrentPage();
if (page) {
  await page.getByRole('button').click();
}`,
              guidelines: [
                "Always check if page exists first.",
                "Automatically waits for element.",
                "Handles scrolling automatically.",
              ],
            },
            {
              signature: "await locator.fill(value)",
              description: "Fills form field with value.",
              example: `const page = getCurrentPage();
if (page) {
  await page.getByLabel('Password').fill('secret');
}`,
              guidelines: [
                "Always check if page exists first.",
                "Preferred over type() for forms.",
                "Clears existing value first.",
              ],
            },
          ],
        },
        {
          title: "Assertions",
          items: [
            {
              signature: "await expect(locator).toBeVisible()",
              description:
                "Asserts element is visible using Playwright assertions.",
              example: `const page = getCurrentPage();
if (page) {
  await expect(page.getByText('Success')).toBeVisible();
}`,
              guidelines: [
                "Uses Playwright's built-in assertions with auto-retry.",
                "More reliable than isVisible() for assertions.",
                "Has built-in timeout and retry logic.",
              ],
            },
            {
              signature: "await expect(locator).toHaveText(text)",
              description:
                "Asserts element's text content using Playwright assertions.",
              example: `const page = getCurrentPage();
if (page) {
  await expect(page.getByRole('heading')).toHaveText('Welcome');
}`,
              guidelines: [
                "Uses Playwright's built-in assertions with auto-retry.",
                "Can check exact or partial text.",
                "More reliable than textContent() for assertions.",
              ],
            },
            {
              signature: "await expect(locator).toHaveCount(number)",
              description: "Asserts number of matching elements.",
              example: `const page = getCurrentPage();
if (page) {
  await expect(page.getByRole('listitem')).toHaveCount(3);
}`,
              guidelines: [
                "Uses Playwright's built-in assertions with auto-retry.",
                "Good for checking element counts.",
                "More reliable than count() for assertions.",
              ],
            },
          ],
        },
        {
          title: "State Checks",
          items: [
            {
              signature: "await locator.isVisible()",
              description: "Checks if element is visible.",
              example: `const page = getCurrentPage();
if (page) {
  if (await page.getByText('Error').isVisible()) {
    // handle error state
  }
}`,
              guidelines: [
                "Returns immediately - good for conditionals.",
                "Use expect().toBeVisible() for assertions.",
                "Good for flow control.",
              ],
            },
            {
              signature: "await page.title()",
              description: "Gets the page title.",
              example: `const page = getCurrentPage();
if (page) {
  const title = await page.title();
  await expect(title).toBe('Expected Title');
}`,
              guidelines: [
                "Returns current page title.",
                "Use with expect for assertions.",
                "Auto-waits for title to be available.",
              ],
            },
          ],
        },
      ],
    };
  }
}
