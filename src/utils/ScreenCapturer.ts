import { SnapshotManager } from "@/utils/SnapshotManager";
import { PromptHandler, ScreenCapturerResult } from "@/types";
import logger from "@/utils/logger";

export class ScreenCapturer {
  constructor(
    private snapshotManager: SnapshotManager,
    private promptHandler: PromptHandler,
  ) {}

  async capture(): Promise<ScreenCapturerResult> {
    const loggerSpinner = logger.startSpinner(
      "Waiting for the screen to reach a stable state...",
    );

    const shouldCaptureSnapshot = this.promptHandler.isSnapshotImageSupported();
    const result: ScreenCapturerResult = await Promise.all([
      shouldCaptureSnapshot
        ? this.snapshotManager.captureSnapshotImage()
        : Promise.resolve(undefined),
      this.snapshotManager.captureViewHierarchyString(),
    ]).then(([snapshot, viewHierarchy]) => ({
      snapshot,
      viewHierarchy: viewHierarchy!,
      isSnapshotImageAttached: snapshot != null && shouldCaptureSnapshot,
    }));

    loggerSpinner.stop(
      "success",
      "Screen has reached a stable state, captured the screen",
    );

    return result;
  }
}
