import type { Page as PuppeteerPage } from "puppeteer";
import {
  TestContext,
  setupTestEnvironment,
  teardownTestEnvironment,
} from "./setup";
import driverUtils from "../driverUtils";

describe("Wix Domains Page Testing", () => {
  let testContext: TestContext;
  let page: PuppeteerPage;

  beforeAll(async () => {
    testContext = await setupTestEnvironment("wix-domains.html", "puppeteer");
    page = testContext.page as PuppeteerPage;
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(testContext);
  });

  beforeEach(async () => {
    await page.evaluate((driverUtils) => {
      driverUtils.cleanupStyleChanges();
    }, driverUtils);
  });

  it("should match the screenshot against the baseline image", async () => {
    await page.evaluate((driverUtils) => {
      driverUtils.markImportantElements();
      driverUtils.manipulateElementStyles();
    }, driverUtils);

    await page.setViewport({ width: 800, height: 600 });
    await page.addStyleTag({
      content: `
        * {
          animation: none !important;
          transition: none !important;
        }
      `,
    });

    await page.waitForNetworkIdle({ idleTime: 500 });
    const screenshot = await page.screenshot({ fullPage: true });

    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: "wix-domains-puppeteer-desktop",
      failureThreshold: 0.05,
      failureThresholdType: "percent",
    });
  });

  it("should generate the expected clean view structure", async () => {
    const structure = await page.evaluate((driverUtils) => {
      driverUtils.markImportantElements();
      return driverUtils.extractCleanViewStructure();
    }, driverUtils);

    expect(structure).toMatchSnapshot("wix-domains-clean-view-structure");
  });
});
