import copilot from "@/index";
import { PromptHandler } from "../../utils/promptHandler";
import { PuppeteerFrameworkDriver } from "@/drivers/puppeteer";

describe("Example Test Suite", () => {
  jest.setTimeout(300000);

  let frameworkDriver: PuppeteerFrameworkDriver;

  beforeAll(async () => {
    const promptHandler: PromptHandler = new PromptHandler();
    frameworkDriver = new PuppeteerFrameworkDriver();

    copilot.init({
      frameworkDriver,
      promptHandler,
    });
  });

  beforeEach(async () => {
    copilot.start();
  });

  afterEach(async () => {
    copilot.end();
  });

  afterAll(async () => {
    if (frameworkDriver.getCurrentBrowser()) {
      await frameworkDriver.getCurrentBrowser()?.close();
    }
  });

  it("perform test with pilot", async () => {
    await copilot.pilot(
      "open https://example.com/ and press on more information, make sure you no longer see the example.com domain",
    );
  });
});
