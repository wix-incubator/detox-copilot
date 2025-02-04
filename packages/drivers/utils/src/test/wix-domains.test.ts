import {
  TestContext,
  setupTestEnvironment,
  teardownTestEnvironment,
} from "./setup";

describe("Wix Domains Page Testing", () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await setupTestEnvironment("wix-domains.html");
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(testContext);
  });

  beforeEach(async () => {
    await testContext.page.evaluate(() => {
      window.driverUtils.cleanupStyleChanges();
    });
  });

  it("should mark all interactive elements in the domains page", async () => {
    const elements = await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      const marked = document.querySelectorAll("[aria-pilot-category]");
      return Array.from(marked).map((el) => ({
        tag: el.tagName.toLowerCase(),
        category: el.getAttribute("aria-pilot-category"),
        index: el.getAttribute("aria-pilot-index"),
        text: el.textContent?.trim(),
      }));
    });

    expect(elements).toMatchSnapshot("wix-domains-marked-elements");
  });

  it("should identify all buttons and links in the navigation", async () => {
    const navElements = await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      const nav = document.querySelector("nav");
      if (!nav) return [];

      const interactiveElements = nav.querySelectorAll("[aria-pilot-category]");
      return Array.from(interactiveElements).map((el) => ({
        tag: el.tagName.toLowerCase(),
        category: el.getAttribute("aria-pilot-category"),
        text: el.textContent?.trim(),
        href: el instanceof HTMLAnchorElement ? el.href : undefined,
      }));
    });

    expect(navElements).toMatchSnapshot("wix-domains-nav-elements");
  });

  it("should properly mark form elements", async () => {
    const formElements = await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      const forms = document.querySelectorAll("form");
      return Array.from(forms).map((form) => ({
        inputs: Array.from(
          form.querySelectorAll("[aria-pilot-category='input']"),
        ).map((input) => ({
          type: input instanceof HTMLInputElement ? input.type : undefined,
          placeholder: input instanceof HTMLInputElement ? input.placeholder : undefined,
          category: input.getAttribute("aria-pilot-category"),
          index: input.getAttribute("aria-pilot-index"),
        })),
        buttons: Array.from(
          form.querySelectorAll("[aria-pilot-category='button']"),
        ).map((button) => ({
          text: button.textContent?.trim(),
          type: button instanceof HTMLButtonElement ? button.type : undefined,
          category: button.getAttribute("aria-pilot-category"),
          index: button.getAttribute("aria-pilot-index"),
        })),
      }));
    });

    expect(formElements).toMatchSnapshot("wix-domains-form-elements");
  });

  it("should handle dynamic content loading", async () => {
    const dynamicElements = await testContext.page.evaluate(async () => {
      // Simulate dynamic content loading
      const container = document.createElement("div");
      container.innerHTML = `
        <button class="dynamic-btn">Dynamic Button</button>
        <a href="#dynamic" class="dynamic-link">Dynamic Link</a>
        <input type="text" class="dynamic-input" placeholder="Dynamic Input">
      `;
      document.body.appendChild(container);

      // Mark elements and get their info
      window.driverUtils.markImportantElements();
      const elements = container.querySelectorAll("[aria-pilot-category]");
      const result = Array.from(elements).map((el) => ({
        tag: el.tagName.toLowerCase(),
        category: el.getAttribute("aria-pilot-category"),
        index: el.getAttribute("aria-pilot-index"),
      }));

      document.body.removeChild(container);
      return result;
    });

    expect(dynamicElements).toMatchSnapshot("wix-domains-dynamic-elements");
  });

  it.skip("should preserve semantic structure of the page", async () => {
    const structure = await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      return window.driverUtils.extractCleanViewStructure();
    });

    // Verify header structure
    expect(structure).toMatch(/<header[^>]*>.*<\/header>/s);
    expect(structure).toMatch(/<nav[^>]*>.*<\/nav>/s);

    // Verify main content structure
    expect(structure).toMatch(/<main[^>]*>.*<\/main>/s);
    expect(structure).toMatch(/aria-pilot-category="semantic"/);

    // Verify form structure
    expect(structure).toMatch(/<form[^>]*>.*<\/form>/s);
    expect(structure).toMatch(/aria-pilot-category="input"/);
    expect(structure).toMatch(/aria-pilot-category="button"/);

    expect(structure).toMatchSnapshot("wix-domains-structure");
  });

  it("should handle hidden elements in accordions and dropdowns", async () => {
    const hiddenElements = await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements({ includeHidden: true });
      const elements = document.querySelectorAll("[aria-pilot-category]");
      return Array.from(elements)
        .filter((el) => {
          const style = window.getComputedStyle(el);
          return style.display === "none" || style.visibility === "hidden";
        })
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          category: el.getAttribute("aria-pilot-category"),
          index: el.getAttribute("aria-pilot-index"),
          parentId: el.parentElement?.id || undefined,
          parentClass: el.parentElement?.className || undefined,
        }));
    });

    expect(hiddenElements).toMatchSnapshot("wix-domains-hidden-elements");
  });
});
