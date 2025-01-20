import {SnapshotManager} from '@/utils/SnapshotManager';
import {PromptHandler} from '@/types';


export class ScreenCapturer {

    constructor(
        private snapshotManager: SnapshotManager,
        private promptHandler: PromptHandler,
    ) {
    }

    async capture() {
        const snapshot = this.promptHandler.isSnapshotImageSupported()
        ? await this.snapshotManager.captureSnapshotImage()
        : undefined;
        const viewHierarchy = await this.snapshotManager.captureViewHierarchyString();

        const isSnapshotImageAttached = snapshot != null && this.promptHandler.isSnapshotImageSupported();

        return {snapshot, viewHierarchy, isSnapshotImageAttached};
    }
}