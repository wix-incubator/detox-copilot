import {
  TestContext,
  setupTestEnvironment,
  teardownTestEnvironment,
} from "./setup";
import { Page as PlaywrightPage } from "playwright";
import driverUtils from "../driverUtils";

describe("Wix Domains Page Testing", () => {
  let testContext: TestContext;
  let page: PlaywrightPage;

  beforeAll(async () => {
    testContext = await setupTestEnvironment("wix-domains.html", "playwright");
    page = testContext.page as PlaywrightPage;
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

    await page.setViewportSize({ width: 800, height: 600 });
    await page.addStyleTag({
      content: `
        * {
          animation: none !important;
          transition: none !important;
        }
      `,
    });

    const screenshot = await page.screenshot({ fullPage: true });

    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: "wix-domains-playwright-desktop",
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
