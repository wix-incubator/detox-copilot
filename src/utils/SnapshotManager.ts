import { TestingFrameworkDriver } from "@/types";
import { SnapshotComparator } from "@/utils/SnapshotComparator";
import crypto from "crypto";

const DEFAULT_POLL_INTERVAL = 100; // ms
const DEFAULT_TIMEOUT = 3000; // ms
const DEFAULT_STABILITY_THRESHOLD = 0.1;

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
      () => this.driver.captureSnapshotImage(),
      (current, last) =>
        this.compareSnapshots(current, last, stabilityThreshold),
      pollInterval,
      timeout,
    );
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
