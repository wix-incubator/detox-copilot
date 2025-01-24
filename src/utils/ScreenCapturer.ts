import { SnapshotManager } from "@/utils/SnapshotManager";
import { PromptHandler } from "@/types";
import logger from "@/utils/logger";

export class ScreenCapturer {
  constructor(
    private snapshotManager: SnapshotManager,
    private promptHandler: PromptHandler,
  ) {}

  async capture() {
    const loggerSpinner = logger.startSpinner(
      `Capturing ${this.promptHandler.isSnapshotImageSupported() ? "snapshot image and " : ""}view hierarchy.`,
    );
    const snapshot = this.promptHandler.isSnapshotImageSupported()
      ? await this.snapshotManager.captureSnapshotImage()
      : undefined;
    const viewHierarchy =
      await this.snapshotManager.captureViewHierarchyString();

    const isSnapshotImageAttached =
      snapshot != null && this.promptHandler.isSnapshotImageSupported();

    loggerSpinner.stop(
      "success",
      "Captured snapshot image and view hierarchy.",
    );
    return { snapshot, viewHierarchy, isSnapshotImageAttached };
  }
}
