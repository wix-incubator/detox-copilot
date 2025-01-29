import { TestingFrameworkDriver } from "@/types";
import { SnapshotComparator } from "@/utils/SnapshotComparator";
import crypto from "crypto";
import gm from "gm";

const MAX_PIXELS = 2000000;
const DEFAULT_POLL_INTERVAL = 500; // ms
const DEFAULT_TIMEOUT = 5000; // ms
const DEFAULT_STABILITY_THRESHOLD = 0.05;

export class SnapshotManager {
  constructor(
    private driver: TestingFrameworkDriver,
    private snapshotComparator: SnapshotComparator,
  ) {}

  private async waitForStableState<T>(
    captureFunc: () => Promise<T | undefined>,
    compareFunc: (current: T, last: T) => Promise<boolean> | boolean,
    pollInterval: number = DEFAULT_POLL_INTERVAL,
    timeout: number = DEFAULT_TIMEOUT,
  ): Promise<T | undefined> {
    const startTime = Date.now();
    let lastSnapshot: T | undefined;

    while (Date.now() - startTime < timeout) {
      const currentSnapshot = await captureFunc();
      if (!currentSnapshot) {
        return undefined;
      }

      if (lastSnapshot) {
        const isStable = await compareFunc(currentSnapshot, lastSnapshot);
        if (isStable) {
          return currentSnapshot;
        }
      }

      lastSnapshot = currentSnapshot;
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    // Return the last snapshot if timeout is reached
    return lastSnapshot;
  }

  private async compareSnapshots(
    current: string,
    last: string,
    stabilityThreshold: number,
  ): Promise<boolean> {
    const currentHash = await this.snapshotComparator.generateHashes(current);
    const lastHash = await this.snapshotComparator.generateHashes(last);

    return this.snapshotComparator.compareSnapshot(
      currentHash,
      lastHash,
      stabilityThreshold,
    );
  }

  private compareViewHierarchies(current: string, last: string): boolean {
    // Use MD5 for fast comparison of view hierarchies
    const currentHash = crypto.createHash("md5").update(current).digest("hex");
    const lastHash = crypto.createHash("md5").update(last).digest("hex");
    return currentHash === lastHash;
  }

  async captureSnapshotImage(
    pollInterval?: number,
    timeout?: number,
    stabilityThreshold: number = DEFAULT_STABILITY_THRESHOLD,
  ): Promise<string | undefined> {
    return this.waitForStableState(
      async () => {
        const imagePath = await this.driver.captureSnapshotImage();
        if (imagePath) {
          const downscaledImagePath = await this.downscaleImage(imagePath);
          return downscaledImagePath;
        }
      },
      (current, last) =>
        this.compareSnapshots(current, last, stabilityThreshold),
      pollInterval,
      timeout,
    );
  }

  private async downscaleImage(imagePath: string): Promise<string> {
   
    return new Promise<string>((resolve, reject) => {
      gm(imagePath)
        .size(function (err: any, size: { width: number; height: number }) {
          if (err) {
            console.error("Error getting image size:", err);
            reject(err);
          } else {
            const originalWidth = size.width;
            const originalHeight = size.height;
            const originalTotalPixels = originalWidth * originalHeight;
  
            if (originalTotalPixels <= MAX_PIXELS) {
              resolve(imagePath);
            } else {
              const aspectRatio = originalWidth / originalHeight;
              const newHeight = Math.sqrt(MAX_PIXELS / aspectRatio);
              const newWidth = newHeight * aspectRatio;
              const roundedWidth = Math.round(newWidth);
              const roundedHeight = Math.round(newHeight);
  
              gm(imagePath)
                .resize(roundedWidth, roundedHeight)
                 .write(imagePath, (err: any) => {
                  if (err) {
                    console.error("Error downscaling image:", err);
                    reject(err);
                  } else {
                    resolve(imagePath);
                  }
                });
            }
          }
        });
    });
  }

  async captureViewHierarchyString(
    pollInterval?: number,
    timeout?: number,
  ): Promise<string> {
    const result = await this.waitForStableState(
      () => this.driver.captureViewHierarchyString(),
      this.compareViewHierarchies,
      pollInterval,
      timeout,
    );
    return result ?? "";
  }
}
