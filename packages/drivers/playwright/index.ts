import {
  TestingFrameworkAPICatalog,
  TestingFrameworkDriver,
} from "@wix/pilot";
import * as playwright from "playwright";
import { expect as playwrightExpect } from "@playwright/test";
import path from "path";
import fs from "fs";
import getCleanDOM from "./utils/getCleanDOM";

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
      fullPage: true,
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
      restrictions: [
        "Never use expect on the page it self for example : await expect(page).toBeVisible()",
      ],
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
setCurrentPage(page);
await page.goto('https://www.test.com/');
await page.waitForLoadState('load')
`,
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
setCurrentPage(page);
await page.goto('https://www.test.com/');
await page.waitForLoadState('load')
`,

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
  await page.waitForLoadState('load')
}`,
              guidelines: [
                "Use only await page.waitForLoadState('load') after page.goto(). never use expect()",
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
}`,
              guidelines: [
                "Avoid explicit waits - let assertions handle timing.",
                "Good for refreshing stale content.",
              ],
            },
          ],
        },
        {
          title: "State Checks",
          items: [
            {
              signature: "await page.waitForLoadState('load')",
              description: "Waits for the page to fully load.",
              example: `const page = getCurrentPage();
            if (page) {
              await page.goto('https://www.wix.com/domains');
              await page.waitForLoadState('load');
            }`,
              guidelines: [
                "Waits until the 'load' event is fired.",
                "Ensures the page is fully loaded before proceeding.",
                "Useful when automatic waiting is insufficient.",
              ],
            },
            {
              signature: "const currentURL = page.url()",
              description: "Gets the current URL of the page.",
              example: `const page = getCurrentPage();
            if (page) {
              const currentURL = page.url();
              console.log('Current URL:', currentURL);
            }`,
              guidelines: [
                "Returns the current URL as a string synchronously.",
                "Useful for logging or conditional logic.",
                "No need to use `await` since it's a synchronous method.",
              ],
            },
            {
              signature: "const title = await page.title()",
              description: "Gets the page title.",
              example: `const page = getCurrentPage();
            if (page) {
              const title = await page.title();
              console.log('Page Title:', title);
            }`,
              guidelines: [
                "Returns the current page title.",
                "Use `await` to get the title asynchronously.",
                "Auto-waits for the title to be available.",
              ],
            },
            {
              signature: "const isVisible = await locator.isVisible()",
              description: "Checks if an element is visible.",
              example: `const page = getCurrentPage();
            if (page) {
              const isVisible = await page.getByText('Sign In').isVisible();
              if (isVisible) {
                // Proceed with sign-in process
              }
            }`,
              guidelines: [
                "Returns a boolean value immediately.",
                "Good for conditional logic and flow control.",
                "Does not auto-wait or retry",
              ],
            },
            {
              signature: "const isEnabled = await locator.isEnabled()",
              description: "Checks if an element is enabled.",
              example: `const page = getCurrentPage();
            if (page) {
              const isEnabled = await page.getByRole('button', { name: 'Submit' }).isEnabled();
              if (isEnabled) {
                // Click the submit button
                await page.getByRole('button', { name: 'Submit' }).click();
              }
            }`,
              guidelines: [
                "Returns a boolean indicating if the element is enabled.",
                "Useful to check if a button or input is interactive.",
                "Good for conditional actions based on element state.",
              ],
            },
            {
              signature: "const isChecked = await locator.isChecked()",
              description: "Checks if a checkbox or radio button is checked.",
              example: `const page = getCurrentPage();
            if (page) {
              const isChecked = await page.getByLabel('Accept Terms').isChecked();
              if (!isChecked) {
                await page.getByLabel('Accept Terms').check();
              }
            }`,
              guidelines: [
                "Returns a boolean indicating if the element is checked.",
                "Applicable to checkboxes and radio buttons.",
                "Good for ensuring the desired state before proceeding.",
              ],
            },
            {
              signature: "const isDisabled = await locator.isDisabled()",
              description: "Checks if an element is disabled.",
              example: `const page = getCurrentPage();
            if (page) {
              const isDisabled = await page.getByRole('button', { name: 'Submit' }).isDisabled();
              if (isDisabled) {
                console.log('Submit button is disabled');
              }
            }`,
              guidelines: [
                "Returns a boolean indicating if the element is disabled.",
                "Useful for checking if an element is not interactive.",
                "Can inform flow control based on element availability.",
              ],
            },
            {
              signature: "const isEditable = await locator.isEditable()",
              description: "Checks if an input element is editable.",
              example: `const page = getCurrentPage();
            if (page) {
              const isEditable = await page.getByPlaceholder('Enter your name').isEditable();
              if (isEditable) {
                await page.fill('input[placeholder="Enter your name"]', 'John Doe');
              }
            }`,
              guidelines: [
                "Returns a boolean indicating if the element can be edited.",
                "Applicable to input, textarea, and contenteditable elements.",
                "Good for ensuring the field is ready for input.",
              ],
            },
            {
              signature: "const isHidden = await locator.isHidden()",
              description: "Checks if an element is hidden.",
              example: `const page = getCurrentPage();
            if (page) {
              const isHidden = await page.getByText('Loading...').isHidden();
              if (isHidden) {
                // Proceed since the loading indicator is gone
              }
            }`,
              guidelines: [
                "Returns a boolean value immediately.",
                "Useful for conditional flow based on element invisibility.",
                "Does not auto-wait or retry; use `expect()` for assertions.",
              ],
            },
            {
              signature: "const isDetached = await locator.isDetached()",
              description: "Checks if an element is detached from the DOM.",
              example: `const page = getCurrentPage();
            if (page) {
              const modal = page.getByRole('dialog');
              // Perform some action that closes the modal
              await page.getByRole('button', { name: 'Close' }).click();
              const isDetached = await modal.isDetached();
              if (isDetached) {
                // Modal has been removed from the DOM
              }
            }`,
              guidelines: [
                "Returns true if the element is not attached to the DOM.",
                "Useful to confirm that an element has been completely removed.",
                "Can inform subsequent actions that depend on DOM structure.",
              ],
            },
            {
              signature: "const textContent = await locator.textContent()",
              description: "Retrieves the text content of an element.",
              example: `const page = getCurrentPage();
            if (page) {
              const message = await page.getByTestId('welcome-message').textContent();
              console.log('Welcome message:', message);
            }`,
              guidelines: [
                "Returns the text inside the element.",
                "Useful for extracting text for further processing.",
                "Consider using `expect().toHaveText()` for assertions.",
              ],
            },
            {
              signature: "const value = await locator.inputValue()",
              description: "Retrieves the current value of an input field.",
              example: `const page = getCurrentPage();
            if (page) {
              const email = await page.getByPlaceholder('Email').inputValue();
              console.log('Entered email:', email);
            }`,
              guidelines: [
                "Returns the value property of input and textarea elements.",
                "Useful for validating or using the input value in logic.",
                "Consider using `expect().toHaveValue()` for assertions.",
              ],
            },
            {
              signature:
                "const elementHandles = await locator.elementHandles()",
              description: "Gets all matching element handles.",
              example: `const page = getCurrentPage();
            if (page) {
              const items = await page.getByRole('listitem').elementHandles();
              console.log('Number of items:', items.length);
            }`,
              guidelines: [
                "Retrieves an array of element handles matching the locator.",
                "Useful for performing actions on multiple elements.",
                "Remember to dispose of handles if necessary to prevent memory leaks.",
              ],
            },
            {
              signature: "await page.waitForTimeout(timeout)",
              description: "Waits for a specified amount of time.",
              example: `const page = getCurrentPage();
            if (page) {
              // Wait for 2 seconds
              await page.waitForTimeout(2000);
            }`,
              guidelines: [
                "Pauses execution for the given time in milliseconds.",
                "Useful for debugging or waiting in non-deterministic cases.",
                "Prefer explicit waits for events or conditions when possible.",
              ],
            },
          ],
        },
        {
          title: "Assertions",
          items: [
            {
              signature: "await expect(locator).toBeVisible()",
              description: "Asserts that the element is visible.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByText('Welcome')).toBeVisible();
        }`,
              guidelines: [
                "Checks that the element is visible on the page.",
                "Automatically waits for the condition to be met.",
                "Throws an error if the element is not visible.",
              ],
            },
            {
              signature: "await expect(locator).toHaveText(expectedText)",
              description:
                "Asserts that the element's text content matches the expected text.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByTestId('username')).toHaveText('John Doe');
        }`,
              guidelines: [
                "Compares the element's text content with the expected text.",
                "Supports partial matches and regular expressions.",
                "Waits until the condition is met or times out.",
              ],
            },
            {
              signature: "await expect(page).toHaveURL(expectedURL)",
              description:
                "Asserts that the page's URL matches the expected URL.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page).toHaveURL('https://www.example.com/dashboard');
        }`,
              guidelines: [
                "Waits for the URL to match the expected value.",
                "Can use regular expressions or glob patterns for matching.",
                "Useful for verifying navigation.",
              ],
            },
            {
              signature: "await expect(locator).toHaveValue(expectedValue)",
              description:
                "Asserts that an input element has the expected value.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByPlaceholder('Email')).toHaveValue('user@example.com');
        }`,
              guidelines: [
                "Checks the 'value' property of input elements.",
                "Automatically waits for the condition.",
                "Useful for validating user input.",
              ],
            },
            {
              signature: "await expect(locator).toBeEnabled()",
              description: "Asserts that the element is enabled.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
        }`,
              guidelines: [
                "Checks that the element can be interacted with.",
                "Waits until the element is enabled.",
                "Throws an error if the element remains disabled.",
              ],
            },
            {
              signature: "await expect(locator).toBeDisabled()",
              description: "Asserts that the element is disabled.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
        }`,
              guidelines: [
                "Checks that the element is not interactive.",
                "Waits until the element is disabled.",
                "Useful for ensuring correct UI state.",
              ],
            },
            {
              signature: "await expect(locator).toBeChecked()",
              description:
                "Asserts that a checkbox or radio button is checked.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByLabel('Accept Terms')).toBeChecked();
        }`,
              guidelines: [
                "Checks that the element is checked.",
                "Waits for the condition to be met.",
                "Throws an error if the element is not checked.",
              ],
            },
            {
              signature: "await expect(locator).toBeEditable()",
              description:
                "Asserts that an input or textarea element is editable.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByPlaceholder('Enter your name')).toBeEditable();
        }`,
              guidelines: [
                "Checks that the element can be edited.",
                "Waits until the element is editable.",
                "Useful before attempting to fill an input.",
              ],
            },
            {
              signature: "await expect(locator).toHaveAttribute(name, value)",
              description:
                "Asserts that the element has the specified attribute value.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByTestId('profile-link')).toHaveAttribute('href', '/profile');
        }`,
              guidelines: [
                "Checks the value of a specified attribute.",
                "Supports regular expressions and partial matching.",
                "Waits for the condition to be met.",
              ],
            },
            {
              signature: "await expect(locator).toHaveClass(expectedClass)",
              description:
                "Asserts that the element has the specified CSS class.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByRole('button', { name: 'Submit' })).toHaveClass('btn-primary');
        }`,
              guidelines: [
                "Checks the 'class' attribute of the element.",
                "Supports multiple classes and partial matches.",
                "Waits for the condition to be met.",
              ],
            },
            {
              signature: "await expect(locator).toContainText(expectedText)",
              description:
                "Asserts that the element's text contains the expected text.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByTestId('notification')).toContainText('Success');
        }`,
              guidelines: [
                "Checks that the element's text includes the expected substring.",
                "Supports regular expressions and partial matches.",
                "Waits for the condition to be met.",
              ],
            },
            {
              signature: "await expect(locator).toHaveJSProperty(name, value)",
              description:
                "Asserts that the element has the specified JavaScript property.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByTestId('toggle')).toHaveJSProperty('checked', true);
        }`,
              guidelines: [
                "Checks the value of a JavaScript property on the element.",
                "Useful for properties not exposed via attributes.",
                "Waits for the condition to be met.",
              ],
            },
            {
              signature: "await expect(locator).not.toBeVisible()",
              description: "Asserts that the element is not visible.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByText('Loading...')).not.toBeVisible();
        }`,
              guidelines: [
                "Checks that the element is hidden or does not exist.",
                "Waits for the condition to be met.",
                "Useful for ensuring elements are not present before proceeding.",
              ],
            },
            {
              signature: "await expect(page).toHaveTitle(expectedTitle)",
              description:
                "Asserts that the page's title matches the expected title.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page).toHaveTitle('Dashboard - MyApp');
        }`,
              guidelines: [
                "Waits for the page's title to match the expected value.",
                "Supports regular expressions and partial matching.",
                "Useful for verifying page navigation.",
              ],
            },
            {
              signature: "await expect(page).toHaveScreenshot([options])",
              description:
                "Asserts that the page's screenshot matches a stored reference image.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page).toHaveScreenshot('dashboard.png');
        }`,
              guidelines: [
                "Compares the current screenshot with a baseline image.",
                "Can specify options like threshold and mask areas.",
                "Useful for visual regression testing.",
              ],
            },
            {
              signature: "await expect(locator).toHaveCount(expectedCount)",
              description:
                "Asserts that the locator resolves to a specific number of elements.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.locator('.todo-item')).toHaveCount(3);
        }`,
              guidelines: [
                "Checks the number of elements matching the locator.",
                "Waits for the condition to be met.",
                "Useful for validating dynamic lists.",
              ],
            },
            {
              signature: "await expect(locator).toBeEmpty()",
              description: "Asserts that the element is empty.",
              example: `const page = getCurrentPage();
        if (page) {
          await expect(page.getByTestId('search-results')).toBeEmpty();
        }`,
              guidelines: [
                "Checks that the element has no text content.",
                "Waits for the condition to be met.",
                "Useful for asserting initial states.",
              ],
            },
          ],
        },
      ],
    };
  }
}
