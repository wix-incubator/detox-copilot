import {
  TestContext,
  setupTestEnvironment,
  teardownTestEnvironment,
} from "./setup";

describe("Visual Regression Testing", () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await setupTestEnvironment();
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(testContext);
  });

  it("should match baseline snapshot with marked elements", async () => {
    await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      window.driverUtils.manipulateElementStyles();
    });

    const image = await testContext.page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.2,
      failureThresholdType: "percent",
      allowSizeMismatch: true,
    });
  });

  it("should match baseline snapshot after cleanup", async () => {
    await testContext.page.evaluate(() => {
      window.driverUtils.cleanupStyleChanges();
    });

    const image = await testContext.page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.2,
      failureThresholdType: "percent",
      allowSizeMismatch: true,
    });
  });

  it("should not affect element positioning or spacing", async () => {
    const getMetrics = async () =>
      await testContext.page.evaluate(() => {
        const elements = document.querySelectorAll(
          "button, a, input, nav, ul, li",
        );
        return Array.from(elements).map((el) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            rect: {
              top: Math.round(rect.top / 10) * 10,
              left: Math.round(rect.left / 10) * 10,
              width: Math.round(rect.width / 10) * 10,
              height: Math.round(rect.height / 10) * 10,
            },
            margin: style.margin,
            padding: style.padding,
          };
        });
      });

    // Capture original layout metrics
    const originalMetrics = await getMetrics();

    // Apply marking and styling
    await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      window.driverUtils.manipulateElementStyles();
    });

    // Compare with new metrics
    const newMetrics = await getMetrics();
    expect(newMetrics).toEqual(originalMetrics);
  });
});
