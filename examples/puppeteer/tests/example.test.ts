import copilot from "@copilot";
import puppeteer from "puppeteer";
import { PromptHandler } from "../../utils/promptHandler";
import { PuppeteerFrameworkDriver } from "@copilot/drivers/puppeteer";

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
    await copilot.pilot(
      "On `https://github.com/wix-incubator/detox-copilot`, " +
        "open the Commits page and summarize the latest commits. " +
        "Open the browser with GUI.",
    );
  });
});
