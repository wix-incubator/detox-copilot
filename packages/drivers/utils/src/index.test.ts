import * as puppeteer from "puppeteer";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { bundleUtils } from "./test-setup";

expect.extend({ toMatchImageSnapshot });

declare global {
  interface Window {
    driverUtils: typeof import("./index").default;
  }
}

describe("driver-utils Puppeteer Tests", () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;
  let bundledCode: string;

  jest.setTimeout(30000);

  beforeAll(async () => {
    try {
      bundledCode = await bundleUtils();
      browser = await puppeteer.launch({
        devtools: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      page = await browser.newPage();
      page.on("console", (msg) => console.log("Browser log:", msg.text()));
      page.on("pageerror", (err) => console.error("Page error:", err));
      page.on("error", (err) => console.error("Browser error:", err));
      page.setDefaultNavigationTimeout(10000);

      await page.goto(`file://${__dirname}/test-pages/test-page.html`);
      await page.addScriptTag({ content: bundledCode });
    } catch (error) {
      console.error("Setup failed:", error);
      throw error;
    }
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  describe("Element Marking Functionality", () => {
    beforeEach(async () => {
      // Reset state before each test
      await page.evaluate(() => {
        window.driverUtils.cleanupStyleChanges();
      });
    });

    it("should mark all supported elements with correct categories", async () => {
      const categories = await page.evaluate(() => {
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
      const hiddenElementsResult = await page.evaluate(() => {
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
      const hiddenElementsResult = await page.evaluate(() => {
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

  describe("Style Manipulation", () => {
    it("should apply correct styles to marked elements", async () => {
      await page.evaluate(() => {
        window.driverUtils.markImportantElements();
        window.driverUtils.manipulateElementStyles();
      });

      const styles = await page.evaluate(() => {
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
      const stylesAfterCleanup = await page.evaluate(() => {
        window.driverUtils.cleanupStyleChanges();
        const styleElement = document.getElementById("aria-pilot-styles");
        const markedElements = document.querySelectorAll(
          "[aria-pilot-category]",
        );

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

  describe("View Structure Extraction", () => {
    it("should generate clean DOM structure with only relevant elements", async () => {
      const structure = await page.evaluate(() => {
        window.driverUtils.markImportantElements();
        return window.driverUtils.extractCleanViewStructure();
      });

      expect(structure).toMatchSnapshot("clean-dom-structure");
    });

    it("should preserve allowed attributes and remove others", async () => {
      const attributesCheck = await page.evaluate(() => {
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
  });

  describe("Visual Regression Testing", () => {
    it("should match baseline snapshot with marked elements", async () => {
      await page.evaluate(() => {
        window.driverUtils.markImportantElements();
        window.driverUtils.manipulateElementStyles();
      });

      const image = await page.screenshot({ fullPage: true });
      expect(image).toMatchImageSnapshot({
        failureThreshold: 0.01,
        failureThresholdType: "percent",
      });
    });

    it("should match baseline snapshot after cleanup", async () => {
      await page.evaluate(() => {
        window.driverUtils.cleanupStyleChanges();
      });

      const image = await page.screenshot({ fullPage: true });
      expect(image).toMatchImageSnapshot({
        failureThreshold: 0.01,
        failureThresholdType: "percent",
      });
    });
  });

  describe.skip("Layout Preservation", () => {
    it("should not affect element positioning or spacing", async () => {
      const getMetrics = async () =>
        await page.evaluate(() => {
          const elements = document.querySelectorAll(
            "button, a, input, nav, ul, li",
          );
          return Array.from(elements).map((el) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return {
              tag: el.tagName.toLowerCase(),
              rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              },
              margin: style.margin,
              padding: style.padding,
            };
          });
        });

      // Capture original layout metrics
      const originalMetrics = getMetrics();

      // Apply marking and styling
      await page.evaluate(() => {
        window.driverUtils.markImportantElements();
        window.driverUtils.manipulateElementStyles();
      });

      // Compare with new metrics
      const newMetrics = await getMetrics();

      expect(newMetrics).toEqual(originalMetrics);
    });
  });

  describe.skip("Clean View Structure", () => {
    it("should preserve element hierarchy and relationships", async () => {
      const structure = await page.evaluate(() => {
        window.driverUtils.markImportantElements();
        return window.driverUtils.extractCleanViewStructure();
      });

      // Verify nav contains ul contains li
      expect(structure).toMatch(/<nav[^>]*>\s*<ul[^>]*>\s*<li[^>]*>/);

      // Verify proper nesting and closing tags
      expect(structure).toMatch(/<nav[^>]*>.*<\/nav>/s);
      expect(structure).toMatch(/<ul[^>]*>.*<\/ul>/s);
      expect(structure).toMatch(/<li[^>]*>.*<\/li>/s);

      // Verify essential attributes
      expect(structure).toMatch(/data-category="semantic"/);
      expect(structure).toMatch(/data-category="list"/);
      expect(structure).toMatch(/href="#test"/);
      expect(structure).toMatch(/type="text"/);
    });

    it("should handle deeply nested structures", async () => {
      await page.evaluate(() => {
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
      });

      const structure = await page.evaluate(() => {
        window.driverUtils.markImportantElements();
        return window.driverUtils.extractCleanViewStructure();
      });

      expect(structure).toMatch(/nav.*ul.*li.*a.*ul.*li.*a/s);
      expect(structure).toMatch(/href="#1\.1"/);
      expect(structure).toMatch(/href="#1\.2"/);
    });
  });
});
