import { TestingFrameworkAPICatalog, TestingFrameworkDriver } from "@/types";
import * as playwright from "playwright";
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
        "Playwright is a Node library which provides a high-level API to control browsers over the DevTools Protocol.\nYou can assume that playwright is already imported (as `playwright`).",
      context: {
        getCurrentPage: this.getCurrentPage,
        setCurrentPage: this.setCurrentPage,
        playwright,
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
              example: "const page = await context.newPage(); setCurrentPage(page);",
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
              signature: "const browser = await playwright.chromium.launch([options])",
              description: "Launches a new browser instance.",
              example: `const browser = await playwright.chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();
setCurrentPage(page);`,
              guidelines: [
                "Options can specify `headless`, `slowMo`, `args`, etc.",
                "Can use chromium, firefox, or webkit browsers.",
                "Remember to call setCurrentPage after creating a page.",
              ],
            },
            {
              signature: "const context = await browser.newContext([options])",
              description: "Creates a new browser context (like an incognito window).",
              example: `const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
setCurrentPage(page);`,
              guidelines: [
                "Each context is isolated with separate cookies/localStorage.",
                "Can configure viewport, geolocation, permissions, etc.",
                "Remember to call setCurrentPage after creating a page.",
              ],
            },
          ],
        },
        {
          title: "Navigation and Loading",
          items: [
            {
              signature: "await page.goto(url[, options])",
              description: "Navigates to a URL and waits for load.",
              example: `const page = getCurrentPage();
await page.goto('https://example.com', { waitUntil: 'networkidle' });`,
              guidelines: [
                "Always check if page exists before navigation.",
                "waitUntil options: load, domcontentloaded, networkidle",
                "Returns the main resource response.",
              ],
            },
            {
              signature: "await page.waitForLoadState(state)",
              description: "Waits for the required load state.",
              example: `const page = getCurrentPage();
if (page) {
  await page.waitForLoadState('networkidle');
}`,
              guidelines: [
                "Always check if page exists first.",
                "States: load, domcontentloaded, networkidle",
                "More reliable than wait timeouts.",
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
              description: "Asserts element is visible.",
              example: `const page = getCurrentPage();
if (page) {
  await expect(page.getByText('Success')).toBeVisible();
}`,
              guidelines: [
                "Always check if page exists first.",
                "Waits for assertion to pass.",
                "Has timeout option.",
              ],
            },
            {
              signature: "await expect(locator).toHaveText(text)",
              description: "Asserts element has text.",
              example: `const page = getCurrentPage();
if (page) {
  await expect(page.getByRole('heading')).toHaveText('Welcome');
}`,
              guidelines: [
                "Always check if page exists first.",
                "Can check exact or partial text.",
                "Supports regex patterns.",
              ],
            },
          ],
        },
        {
          title: "State and Properties",
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
                "Always check if page exists first.",
                "Returns boolean immediately.",
                "Good for conditional logic.",
              ],
            },
            {
              signature: "await page.title()",
              description: "Gets the page title.",
              example: `const page = getCurrentPage();
if (page) {
  const title = await page.title();
}`,
              guidelines: [
                "Always check if page exists first.",
                "Returns current page title.",
                "Waits for title to be set.",
              ],
            },
          ],
        },
      ],
    };
  }
}
