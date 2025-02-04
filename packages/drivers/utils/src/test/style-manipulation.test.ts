import {
  TestContext,
  setupTestEnvironment,
  teardownTestEnvironment,
} from "./setup";

describe("Style Manipulation", () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await setupTestEnvironment();
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(testContext);
  });

  it("should apply correct styles to marked elements", async () => {
    await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      window.driverUtils.manipulateElementStyles();
    });

    const styles = await testContext.page.evaluate(() => {
      const elements = document.querySelectorAll("[aria-pilot-category]");
      return Array.from(elements).map((el) => ({
        category: el.getAttribute("aria-pilot-category"),
        computedStyle: {
          border: window.getComputedStyle(el).border,
          position: window.getComputedStyle(el).position,
          margin: window.getComputedStyle(el).margin,
        },
      }));
    });

    expect(styles).toMatchSnapshot("applied-styles");
  });

  it("should properly clean up all applied styles", async () => {
    const stylesAfterCleanup = await testContext.page.evaluate(() => {
      window.driverUtils.cleanupStyleChanges();
      const styleElement = document.getElementById("aria-pilot-styles");
      const markedElements = document.querySelectorAll("[aria-pilot-category]");

      return {
        styleElementExists: styleElement !== null,
        elementsWithComputedStyles: Array.from(markedElements).map((el) => ({
          tag: el.tagName.toLowerCase(),
          border: window.getComputedStyle(el).border,
          position: window.getComputedStyle(el).position,
        })),
      };
    });

    expect(stylesAfterCleanup).toMatchSnapshot("styles-after-cleanup");
  });
}); 
