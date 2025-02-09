import {
  TestContext,
  setupTestEnvironment,
  teardownTestEnvironment,
} from "./setup";

describe("Element Marking Functionality", () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await setupTestEnvironment();
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(testContext);
  });

  beforeEach(async () => {
    // Reset state before each test
    await testContext.page.evaluate(() => {
      window.driverUtils.cleanupStyleChanges();
    });
  });

  it("should mark all supported elements with correct categories", async () => {
    const categories = await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      const elements = document.querySelectorAll("[aria-pilot-category]");
      return Array.from(elements).map((el) => ({
        tag: el.tagName.toLowerCase(),
        category: el.getAttribute("aria-pilot-category"),
        index: el.getAttribute("aria-pilot-index"),
      }));
    });

    expect(categories).toMatchSnapshot("element-categories");
  });

  it("should handle hidden elements correctly", async () => {
    const hiddenElementsResult = await testContext.page.evaluate(() => {
      // Add some hidden elements
      const div = document.createElement("div");
      div.innerHTML = `
        <button style="display: none">Hidden Button</button>
        <a href="#" style="visibility: hidden">Hidden Link</a>
        <input type="text" hidden>
      `;
      document.body.appendChild(div);

      // Mark elements without including hidden
      window.driverUtils.markImportantElements();

      // Check if hidden elements were marked
      const hiddenElements = Array.from(div.children);
      return hiddenElements.map((el) => ({
        tag: el.tagName.toLowerCase(),
        hasCategory: el.hasAttribute("aria-pilot-category"),
      }));
    });

    expect(hiddenElementsResult).toMatchSnapshot("hidden-elements-handling");
  });

  it("should mark hidden elements when includeHidden option is true", async () => {
    const hiddenElementsResult = await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements({ includeHidden: true });
      const elements = document.querySelectorAll("[aria-pilot-category]");
      return Array.from(elements).map((el) => ({
        tag: el.tagName.toLowerCase(),
        category: el.getAttribute("aria-pilot-category"),
        isHidden:
          window.getComputedStyle(el).display === "none" ||
          window.getComputedStyle(el).visibility === "hidden" ||
          el.hasAttribute("hidden"),
      }));
    });

    expect(hiddenElementsResult).toMatchSnapshot("hidden-elements-included");
  });
});
