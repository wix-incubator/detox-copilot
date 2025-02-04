import copilot from "@pilot/core";
import { PromptHandler } from "../utils/promptHandler";
import { PlaywrightFrameworkDriver } from "@pilot/playwright-driver";

describe("Example Test Suite", () => {
  jest.setTimeout(300000);

  let frameworkDriver: PlaywrightFrameworkDriver;

  beforeAll(async () => {
    const promptHandler: PromptHandler = new PromptHandler();

    frameworkDriver = new PlaywrightFrameworkDriver();

    copilot.init({
      frameworkDriver,
      promptHandler,
    });
  });

  afterAll(async () => {
    const page = frameworkDriver.getCurrentPage();
    if (page) {
      await page.context().browser()?.close();
    }
  });

  beforeEach(async () => {
    copilot.start();
  });

  afterEach(async () => {
    copilot.end();
  });

  it("perform test with pilot", async () => {
    await copilot.pilot(
      "Open https://www.wix.com/domains and search for the domain Shraga.com, is it available?",
    );
  });
});
