import copilot from "@copilot";
import { PromptHandler } from "../../utils/promptHandler";
import { PlaywrightFrameworkDriver } from "@copilot/drivers/playwright";

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
      "Open Wix.com and search for the domain Shraga.com, is it available?",
    );
  });
});
