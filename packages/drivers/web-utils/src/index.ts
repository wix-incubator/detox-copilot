import fs from "fs";
import path from "path";
import { Page } from "./types";

export default class WebTestingFrameworkDriverHelper {
  protected currentPage?: Page;

  constructor() {}

  /**
   * Executes a bundled script within the page context.
   * @param page - The web page instance.
   * @param bundleRelativePath - Relative path to the bundled script.
   * @param returnResult - Whether to return the result of the script execution.
   */
  private async executeBundledScript(
    page: Page,
    bundleRelativePath: string,
  ): Promise<any> {
    const bundlePath = path.resolve(__dirname, bundleRelativePath);
    const bundleString = fs.readFileSync(bundlePath, "utf8");
    await page.evaluate((code: string) => eval(code), bundleString);
  }

  /**
   * Injects bundled code and marks important elements.
   */
  async markElements(page: Page): Promise<void> {
    await this.executeBundledScript(
      page,
      "../dist/markImportantElements.bundle.js",
    );
  }

  /**
   * Manipulates element styles.
   */
  async manipulateStyles(page: Page): Promise<void> {
    await this.executeBundledScript(
      page,
      "../dist/manipulateElementStyles.bundle.js",
    );
  }

  /**
   * Cleans up style changes.
   */
  async cleanUpStyleChanges(page: Page): Promise<void> {
    await this.executeBundledScript(
      page,
      "../dist/cleanupStyleChanges.bundle.js",
    );
  }

  /**
   * Gets the clean view hierarchy as a string.
   */
  async getCleanView(page: Page): Promise<string> {
    return await page.evaluate(() => {
      return window.extractCleanViewStructure();
    });
  }

  /**
   * Captures a snapshot image.
   */
  async captureSnapshotImage(): Promise<string | undefined> {
    if (!this.currentPage) {
      return undefined;
    }

    const tempDir = "temp";
    const fileName = `snapshot_${Date.now()}.png`;
    const filePath = path.resolve(tempDir, fileName);

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    await this.markElements(this.currentPage);
    await this.manipulateStyles(this.currentPage);

    await this.currentPage.screenshot({
      path: filePath,
      fullPage: true,
    });

    await this.cleanUpStyleChanges(this.currentPage);
    return filePath;
  }

  /**
   * Captures the view hierarchy as a string.
   */
  async captureViewHierarchyString(): Promise<string> {
    if (!this.currentPage) {
      return (
        "CANNOT SEE ANY ACTIVE PAGE, " +
        "START A NEW ONE BASED ON THE ACTION NEED OR RAISE AN ERROR"
      );
    }

    await this.markElements(this.currentPage);
    return await this.getCleanView(this.currentPage);
  }

  /**
   * Sets the current working page.
   */
  setCurrentPage(page: Page): void {
    this.currentPage = page;
  }

  /**
   * Gets the current page.
   */
  getCurrentPage(): Page | undefined {
    return this.currentPage;
  }
}
