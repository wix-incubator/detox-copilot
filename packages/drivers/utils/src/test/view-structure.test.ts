import {
  TestContext,
  setupTestEnvironment,
  teardownTestEnvironment,
} from "./setup";

describe("View Structure Extraction", () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await setupTestEnvironment();
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(testContext);
  });

  it("should generate clean DOM structure with only relevant elements", async () => {
    const structure = await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      return window.driverUtils.extractCleanViewStructure();
    });

    expect(structure).toMatchSnapshot("clean-dom-structure");
  });

  it("should preserve allowed attributes and remove others", async () => {
    const attributesCheck = await testContext.page.evaluate(() => {
      // Add some elements with various attributes
      const div = document.createElement("div");
      div.innerHTML = `
        <button class="btn" style="color: red" data-test="value" onclick="alert()">Test</button>
        <a href="#link" target="_blank" rel="noopener" style="color: blue">Link</a>
        <img src="test.jpg" alt="Test" width="100" height="100">
      `;
      document.body.appendChild(div);

      window.driverUtils.markImportantElements();
      const structure = window.driverUtils.extractCleanViewStructure();
      document.body.removeChild(div);

      return structure;
    });

    expect(attributesCheck).toMatchSnapshot("attribute-filtering");
  });

  it("should preserve element hierarchy and relationships", async () => {
    const structure = await testContext.page.evaluate(() => {
      // Add complex nested structure
      const complex = document.createElement("div");
      complex.innerHTML = `
        <nav data-testid="main-nav">
          <ul>
            <li>
              <a href="#1">Link 1</a>
              <ul>
                <li><a href="#1.1">Sublink 1.1</a></li>
                <li><a href="#1.2">Sublink 1.2</a></li>
              </ul>
            </li>
          </ul>
        </nav>
      `;
      document.body.appendChild(complex);

      window.driverUtils.markImportantElements();
      const result = window.driverUtils.extractCleanViewStructure();
      document.body.removeChild(complex);

      return result;
    });

    // Verify semantic structure is preserved
    expect(structure).toMatch(
      /aria-pilot-category="semantic".*aria-pilot-category="list"/s,
    );

    // Verify proper nesting and closing tags
    expect(structure).toMatch(/<nav[^>]*>.*<\/nav>/s);
    expect(structure).toMatch(/<ul[^>]*>.*<\/ul>/s);

    // Verify categories are assigned correctly
    expect(structure).toMatch(/aria-pilot-category="semantic"[^>]*>.*<nav/s);
    expect(structure).toMatch(/aria-pilot-category="list"[^>]*>.*<\/ul>/s);
  });
});
