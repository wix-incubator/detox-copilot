import pilot from "@wix-pilot/core";
import { PromptHandler } from "../utils/promptHandler";
import { WebdriverIOAppiumFrameworkDriver } from "../index";
describe("Example Test Suite", () => {
  jest.setTimeout(300000);

  let frameworkDriver: WebdriverIOAppiumFrameworkDriver;

  beforeAll(async () => {
    const promptHandler: PromptHandler = new PromptHandler();
    frameworkDriver = new WebdriverIOAppiumFrameworkDriver();

    pilot.init({
      frameworkDriver,
      promptHandler,
    });
  });

  
  beforeEach(async () => {
    pilot.start();
  });

  afterEach(async () => {
    pilot.end();
  });

  it("perform test with pilot", async () => {
    await pilot.autopilot(
      "Open https://github.com/wix-incubator/pilot and tell me what was the last commit about and who have created it",
    );
  });
});
