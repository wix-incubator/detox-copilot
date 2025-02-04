import {
  TestContext,
  setupTestEnvironment,
  teardownTestEnvironment,
} from "./setup";
import { MatchImageSnapshotOptions } from "jest-image-snapshot";
import DriverUtils from "../index";

declare global {
  interface Window {
    driverUtils: typeof DriverUtils;
  }
}

describe("Wix Domains Visual Testing", () => {
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

  const snapshotConfig: MatchImageSnapshotOptions = {
    failureThreshold: 0.2,
    failureThresholdType: "percent" as const,
    allowSizeMismatch: true,
    customDiffConfig: {
      threshold: 0.2,
    },
  };

  it("should match baseline snapshot of the domains page", async () => {
    const image = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(image).toMatchImageSnapshot({
      ...snapshotConfig,
      customSnapshotIdentifier: "wix-domains-initial",
    });
  });

  it("should match snapshot with marked interactive elements", async () => {
    await testContext.page.evaluate(() => {
      window.driverUtils.markImportantElements();
      window.driverUtils.manipulateElementStyles();
    });

    const image = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(image).toMatchImageSnapshot({
      ...snapshotConfig,
      customSnapshotIdentifier: "wix-domains-marked",
    });
  });

  it("should match snapshot with marked form elements", async () => {
    await testContext.page.evaluate(() => {
      // Focus on search form
      const searchInput = document.querySelector(
        'input[aria-label="Domain search"]',
      );
      if (searchInput instanceof HTMLElement) {
        searchInput.focus();
      }
      window.driverUtils.markImportantElements();
      window.driverUtils.manipulateElementStyles();
    });

    const image = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(image).toMatchImageSnapshot({
      ...snapshotConfig,
      customSnapshotIdentifier: "wix-domains-forms",
    });
  });

  it("should match snapshot with dropdown menu open", async () => {
    await testContext.page.evaluate(() => {
      // Open account dropdown
      const accountBtn = document.querySelector(".account-btn");
      if (accountBtn instanceof HTMLElement) {
        accountBtn.click();
      }
      window.driverUtils.markImportantElements({ includeHidden: true });
      window.driverUtils.manipulateElementStyles();
    });

    const image = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(image).toMatchImageSnapshot({
      ...snapshotConfig,
      customSnapshotIdentifier: "wix-domains-dropdown",
    });
  });

  it("should match snapshot of domain search results", async () => {
    await testContext.page.evaluate(() => {
      // Show domain results section
      const hiddenContent = document.querySelector(".hidden-content");
      if (hiddenContent instanceof HTMLElement) {
        hiddenContent.style.display = "block";
      }
      window.driverUtils.markImportantElements({ includeHidden: true });
      window.driverUtils.manipulateElementStyles();
    });

    const image = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(image).toMatchImageSnapshot({
      ...snapshotConfig,
      customSnapshotIdentifier: "wix-domains-results",
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
      ...snapshotConfig,
      customSnapshotIdentifier: "wix-domains-mobile",
    });

    // Test tablet viewport
    await testContext.page.setViewport({ width: 768, height: 1024 });
    const tabletImage = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(tabletImage).toMatchImageSnapshot({
      ...snapshotConfig,
      customSnapshotIdentifier: "wix-domains-tablet",
    });

    // Test desktop viewport
    await testContext.page.setViewport({ width: 1440, height: 900 });
    const desktopImage = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(desktopImage).toMatchImageSnapshot({
      ...snapshotConfig,
      customSnapshotIdentifier: "wix-domains-desktop",
    });
  });

  it("should match snapshot of filter section with checkboxes", async () => {
    await testContext.page.evaluate(() => {
      // Check some filter checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox, index) => {
        if (index < 2 && checkbox instanceof HTMLInputElement) {
          checkbox.checked = true;
        }
      });
      window.driverUtils.markImportantElements();
      window.driverUtils.manipulateElementStyles();
    });

    const image = await testContext.page.screenshot({
      fullPage: true,
      captureBeyondViewport: true,
    });
    expect(image).toMatchImageSnapshot({
      ...snapshotConfig,
      customSnapshotIdentifier: "wix-domains-filters",
    });
  });
}); 
