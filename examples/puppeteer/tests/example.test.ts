import copilot from "@copilot";
import { PromptHandler } from "../../utils/promptHandler";
import { PuppeteerFrameworkDriver } from "@copilot/drivers/puppeteer";

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
    await copilot.pilot(
      "Enter https://example.com/, press on more information, " +
        "expect to be redirected to IANA site, summarize the findings. " +
        "Open in non-headless mode.",
    );
  });
});
