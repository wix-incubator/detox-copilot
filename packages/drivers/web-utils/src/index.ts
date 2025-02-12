import fs from "fs";
import path from "path";
import { Page } from "./types";

export default class WebTestingFrameworkDriverHelper {
  protected currentPage?: Page;

  constructor() {}

  /**
   * Injects bundled code and marks important elements
   */
  private async injectCodeAndMarkElements(page: Page): Promise<void> {
    const bundledCodePath = require.resolve("../dist/web-utils.browser.js");
    const bundledCode = fs.readFileSync(bundledCodePath, "utf8");
    await page.evaluate((bundledCode) => {
      // eval bundled code as IIFE code:
      eval(bundledCode);
      // const func = new Function(
      //   fs.readFileSync(bundledCodePath, "utf8")
      // )();
    }, bundledCode);
  }

  /**
   * Manipulates element styles
   */
  private async manipulateStyles(page: Page): Promise<void> {
    // await page.evaluate(() => {
    //   window.driverUtils.manipulateElementStyles();
    // });
  }

  /**
   * Cleans up style changes
   */
  private async cleanUpStyleChanges(page: Page): Promise<void> {
    // await page.evaluate(() => {
    //   window.driverUtils.cleanupStyleChanges();
    // });
  }

  /**
   * Captures a snapshot image
   */
  async captureSnapshotImage(): Promise<string | undefined> {
    if (!this.currentPage) {
      return undefined;
    }

    const fileName = `temp/snapshot_${Date.now()}.png`;

    // Create temp directory if it doesn't exist
    if (!fs.existsSync("temp")) {
      fs.mkdirSync("temp");
    }

    await this.injectCodeAndMarkElements(this.currentPage);
    await this.manipulateStyles(this.currentPage);
    await this.currentPage.screenshot({
      path: fileName,
      fullPage: true,
    });
    await this.cleanUpStyleChanges(this.currentPage);
    return path.resolve(fileName);
  }

  /**
   * Captures the view hierarchy as a string
   */
  async captureViewHierarchyString(): Promise<string> {
    if (!this.currentPage) {
      return (
        "CANNOT SEE ANY ACTIVE PAGE, " +
        "START A NEW ONE BASED ON THE ACTION NEED OR RAISE AN ERROR"
      );
    }
    await this.injectCodeAndMarkElements(this.currentPage);
    // return await this.currentPage.evaluate(() => {
    //   return window.driverUtils.extractCleanViewStructure();
    // });

    return "HELLO";
  }

  /**
   * Sets current working page
   */
  setCurrentPage(page: Page) {
    this.currentPage = page;
  }

  /**
   * Gets the current page identifier
   */
  getCurrentPage(): Page | undefined {
    return this.currentPage;
  }
}
