import copilot from "@pilot/core";
import type { Browser, Page } from "puppeteer-core";
import puppeteer from "puppeteer-core";
import { PuppeteerFrameworkDriver } from "../index";
import { PromptHandler } from "../utils/promptHandler";

describe("Example Test Suite", () => {
  jest.setTimeout(300000);

  let frameworkDriver: PuppeteerFrameworkDriver;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    const promptHandler = new PromptHandler();
    // Launch browser first
    browser = await puppeteer.launch({
      headless: false,
      executablePath:
        process.env.CHROME_PATH ||
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    });

    // Create a new page
    page = await browser.newPage();
    // Initialize framework driver
    frameworkDriver = new PuppeteerFrameworkDriver();
    frameworkDriver.setCurrentPage(page);

    copilot.init({
      frameworkDriver,
      promptHandler,
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    await copilot.start();
  });

  afterEach(async () => {
    await copilot.end();
  });

  it("should search for domain on Wix", async () => {
    await copilot.pilot(
      "Go to https://www.wix.com/domains, search the domain WixPilot.com, " +
        "it should be available. Open in not-headless browser.",
    );
  }, 60000);
});
