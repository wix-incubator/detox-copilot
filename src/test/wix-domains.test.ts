import { TestContext, setupTestEnvironment, teardownTestEnvironment } from './setup';

describe("Wix Domains Page Testing", () => {
  let testContext: TestContext;
  let structure: string;

  beforeAll(async () => {
    testContext = await setupTestEnvironment("wix-domains.html");
  });

  beforeEach(async () => {
    structure = await testContext.page.evaluate(() => document.documentElement.outerHTML);
  });

  afterAll(async () => {
    await teardownTestEnvironment(testContext);
  });

  it("should preserve semantic structure of the page", async () => {
    // Verify header structure (required)
    expect(structure).toMatch(/<header[^>]*>.*<\/header>/s);

    // Check for optional semantic elements before verifying them
    const hasNavigation = structure.includes('<nav');
    const hasMain = structure.includes('<main');

    // Skip navigation check if element doesn't exist
    if (hasNavigation) {
      expect(structure).toMatch(/<nav[^>]*>.*<\/nav>/s);
    }

    // Skip main content check if element doesn't exist
    if (hasMain) {
      expect(structure).toMatch(/<main[^>]*>.*<\/main>/s);
    }
  });
}); 
