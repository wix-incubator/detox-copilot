import { SnapshotComparator } from "./SnapshotComparator";
import { getSnapshotImage } from "@/test-utils/SnapshotComparatorTestImages/SnapshotImageGetter";

describe("SnapshotComparator", () => {
    const snapshotComparator = new SnapshotComparator();
    
    it("should hash a snapshot", async () => {
        const snapshot = getSnapshotImage("baseline");
        const hash = await snapshotComparator.generateHashes(snapshot);

        expect(hash).toBeDefined();
    });

    it("should be similar for the same image", async () => {
        const snapshot = getSnapshotImage("baseline");
        const hash = await snapshotComparator.generateHashes(snapshot);
        const isSimilar = await snapshotComparator.compareSnapshot(snapshot, hash, 0.1);
        expect(isSimilar).toBeTruthy();
    });

    it("should not be similar for different images and low threshold", async () => {
        const snapshot1 = getSnapshotImage("baseline");
        const snapshot2 = getSnapshotImage("very_different");
        
        const hash1 = await snapshotComparator.generateHashes(snapshot1);
        const hash2 = await snapshotComparator.generateHashes(snapshot2);
        const isSimilar = await snapshotComparator.compareSnapshot(snapshot2, hash1, 0.1);

        expect(hash2).not.toEqual(hash1);
        expect(isSimilar).toBeFalsy();
    });
});
