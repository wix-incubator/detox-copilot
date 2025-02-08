import copilot from "@wix-pilot/core";
import puppeteer from "puppeteer";
import { PromptHandler } from "../utils/promptHandler";
import { PuppeteerFrameworkDriver } from "../index";

describe("Example Test Suite", () => {
  jest.setTimeout(300000);

  let frameworkDriver: PuppeteerFrameworkDriver;

  beforeAll(async () => {
    const promptHandler: PromptHandler = new PromptHandler();

    frameworkDriver = new PuppeteerFrameworkDriver();
    frameworkDriver = new PuppeteerFrameworkDriver(puppeteer.executablePath());

    copilot.init({
      frameworkDriver,
      promptHandler,
    });
  });

  afterAll(async () => {
    frameworkDriver.getCurrentPage()?.browser().close();
  });

  beforeEach(async () => {
    copilot.start();
  });

  afterEach(async () => {
    copilot.end();
  });

  it("perform test with pilot", async () => {
    await copilot.autopilot(
      "On `https://github.com/wix-incubator/pilot`, " +
        "open the Commits page and summarize the latest commits. " +
        "Open the browser with GUI.",
    );
  });
});
