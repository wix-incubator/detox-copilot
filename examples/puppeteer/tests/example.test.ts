import copilot from "@copilot";
import { PromptHandler } from "../../utils/promptHandler";
import { PuppeteerFrameworkDriver } from "@copilot/drivers/puppeteer";

describe("Example Test Suite", () => {
  jest.setTimeout(300000);

  beforeAll(async () => {
    const promptHandler: PromptHandler = new PromptHandler();

    const frameworkDriver = new PuppeteerFrameworkDriver();

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

  it("perform test with pilot", async () => {
    await copilot.pilot(
      "open https://example.com/ and press on more information",
    );
  });
});
