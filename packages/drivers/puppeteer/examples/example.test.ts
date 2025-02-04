import copilot from "@pilot/core";
import puppeteer from "puppeteer";
import { PuppeteerFrameworkDriver } from "../index";
import { PromptHandler } from "../utils/promptHandler";

describe("Example Test Suite", () => {
  jest.setTimeout(300000);

  let frameworkDriver: PuppeteerFrameworkDriver;

  beforeAll(async () => {
    const promptHandler = new PromptHandler();
    frameworkDriver = new PuppeteerFrameworkDriver(
      puppeteer.executablePath()
    );

    copilot.init({
      frameworkDriver,
      promptHandler,
    });
  });

  afterAll(async () => {
    const page = frameworkDriver.getCurrentPage();
    if (page) {
      const browser = page.browser();
      if (browser) {
        await browser.close();
      }
    }
  });

  beforeEach(async () => {
    copilot.start();
  });

  afterEach(async () => {
    copilot.end();
  });

  it("should search for domain on Wix", async () => {
    await copilot.pilot(
      "Go to https://www.wix.com/domains, search the domain WixPilot.com, " +
        "it should be available. Open in not-headless browser.",
    );
  }, 60000);
});
