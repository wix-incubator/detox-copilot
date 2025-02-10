import {
  TestContext,
  setupTestEnvironment,
  teardownTestEnvironment,
} from "./setup";
import { Page as PlaywrightPage } from "playwright";

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
    await page.evaluate(() => {
      (window as any).driverUtils.cleanupStyleChanges();
    });
  });

  it("should match the screenshot against the baseline image", async () => {
    await page.evaluate(() => {
      (window as any).driverUtils.markImportantElements();
      (window as any).driverUtils.manipulateElementStyles();
    });

    await page.setViewportSize({ width: 800, height: 12587 });

    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: "wix-domains-playwright-desktop",
      failureThreshold: 0.05,
      failureThresholdType: "percent",
    });
  });

  it("should generate the expected clean view structure", async () => {
    const structure = await page.evaluate(() => {
      (window as any).driverUtils.markImportantElements();
      return (window as any).driverUtils.extractCleanViewStructure();
    });
    expect(structure).toMatchSnapshot("wix-domains-clean-view-structure");
  });
});