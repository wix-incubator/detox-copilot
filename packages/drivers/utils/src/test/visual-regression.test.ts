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

  it("should match baseline snapshot of the initial page state", async () => {
    const image = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: "percent",
      allowSizeMismatch: true,
    });
  });

  it("should match baseline snapshot with marked elements", async () => {
    await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      window.driverUtils.manipulateElementStyles();
    });

    const image = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: "percent",
      allowSizeMismatch: true,
    });
  });

  it("should match baseline snapshot after cleanup", async () => {
    await testContext.page.evaluate(() => {
      window.driverUtils.cleanupStyleChanges();
    });

    const image = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: "percent",
      allowSizeMismatch: true,
    });
  });

  it("should match baseline snapshot with hidden elements included", async () => {
    await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements({ includeHidden: true });
      window.driverUtils.manipulateElementStyles();
    });

    const image = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.05,
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

    // Take a snapshot of the page with marked elements
    const markedImage = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(markedImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: "percent",
      allowSizeMismatch: true,
      customSnapshotIdentifier: "marked-elements-layout",
    });

    // Compare with new metrics
    const newMetrics = await getMetrics();
    expect(newMetrics).toEqual(originalMetrics);

    // Cleanup and take final snapshot
    await testContext.page.evaluate(() => {
      window.driverUtils.cleanupStyleChanges();
    });

    const cleanupImage = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(cleanupImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: "percent",
      allowSizeMismatch: true,
      customSnapshotIdentifier: "cleanup-layout",
    });
  });

  it("should maintain visual consistency across different viewport sizes", async () => {
    // Test mobile viewport
    await testContext.page.setViewport({ width: 375, height: 667 });
    await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      window.driverUtils.manipulateElementStyles();
    });
    const mobileImage = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(mobileImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: "percent",
      allowSizeMismatch: true,
      customSnapshotIdentifier: "mobile-viewport",
    });

    // Test tablet viewport
    await testContext.page.setViewport({ width: 768, height: 1024 });
    const tabletImage = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(tabletImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: "percent",
      allowSizeMismatch: true,
      customSnapshotIdentifier: "tablet-viewport",
    });

    // Test desktop viewport
    await testContext.page.setViewport({ width: 1440, height: 900 });
    const desktopImage = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(desktopImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: "percent",
      allowSizeMismatch: true,
      customSnapshotIdentifier: "desktop-viewport",
    });
  });
});
