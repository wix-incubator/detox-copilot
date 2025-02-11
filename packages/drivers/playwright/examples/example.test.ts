import pilot from "@wix-pilot/core";
import { PromptHandler } from "../utils/promptHandler";
import { PlaywrightFrameworkDriver } from "../index";
import WebTestingFrameworkDriverUtils from "@wix-pilot/web-utils";

describe("Example Test Suite", () => {
  jest.setTimeout(300000);

  let frameworkDriver: PlaywrightFrameworkDriver;

  beforeAll(async () => {
    const promptHandler: PromptHandler = new PromptHandler();
    const driverUtils: WebTestingFrameworkDriverUtils =
      new WebTestingFrameworkDriverUtils();
    frameworkDriver = new PlaywrightFrameworkDriver(driverUtils);

    pilot.init({
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
    pilot.start();
  });

  afterEach(async () => {
    pilot.end();
  });

  it("perform test with pilot", async () => {
    await pilot.autopilot(
      "Open https://www.wix.com/domains and search for the domain Shraga.com, is it available?",
    );
  });
});
