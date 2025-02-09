import * as puppeteer from "puppeteer";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { bundleDriverUtils } from "./bundle";

expect.extend({ toMatchImageSnapshot });

declare global {
  interface Window {
    driverUtils: typeof import("../index").default;
  }
}

export interface TestContext {
  browser: puppeteer.Browser;
  page: puppeteer.Page;
  bundledCode: string;
}

export async function setupTestEnvironment(
  testPage: string = "test-page.html",
): Promise<TestContext> {
  try {
    const bundledCode = await bundleDriverUtils();
    const browser = await puppeteer.launch({
      headless: "new",
      devtools: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    page.on("console", (msg) => console.log("Browser log:", msg.text()));
    page.on("pageerror", (err) => console.error("Page error:", err));
    page.on("error", (err) => console.error("Browser error:", err));
    page.setDefaultNavigationTimeout(10000);

    await page.goto(`file://${__dirname}/test-pages/${testPage}`);
    await page.addScriptTag({ content: bundledCode });

    return { browser, page, bundledCode };
  } catch (error) {
    console.error("Setup failed:", error);
    throw error;
  }
}

export async function teardownTestEnvironment({ browser }: TestContext) {
  if (browser) {
    await browser.close();
  }
}

beforeAll(() => {
  jest.setTimeout(30000);
});
