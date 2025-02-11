import pilot from "@wix-pilot/core";
import puppeteer from "puppeteer";
import { PromptHandler } from "../utils/promptHandler";
import { PuppeteerFrameworkDriver } from "../index";
import WebTestingFrameworkDriverUtils from "@wix-pilot/web-utils";

describe("Example Test Suite", () => {
  jest.setTimeout(300000);

  let frameworkDriver: PuppeteerFrameworkDriver;

  beforeAll(async () => {
    const promptHandler: PromptHandler = new PromptHandler();
    const driverUtils: WebTestingFrameworkDriverUtils =
      new WebTestingFrameworkDriverUtils();
    frameworkDriver = new PuppeteerFrameworkDriver(
      driverUtils,
      puppeteer.executablePath(),
    );

    pilot.init({
      frameworkDriver,
      promptHandler,
    });
  });

  afterAll(async () => {
    frameworkDriver.getCurrentPage()?.browser().close();
  });

  beforeEach(async () => {
    pilot.start();
  });

  afterEach(async () => {
    pilot.end();
  });

  it("perform test with pilot", async () => {
    await pilot.autopilot(
      "Open https://www.wix.com/domains, and search for the domain Shraga.com, is it available?. if there is cookies message decline it",
    );
  });
});
