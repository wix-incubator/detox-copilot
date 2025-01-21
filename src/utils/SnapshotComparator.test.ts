import { SnapshotComparator } from "./SnapshotComparator";
import path from "path";

const snapShotTestImagesFolder = path.resolve(
  __dirname,
  "./SnapshotComparatorTestImages"
);

describe("SnapshotComparator", () => {
    const snapshotComparator = new SnapshotComparator();
    
    it("should hash a snapshot", async () => {
        const snapshot = `${snapShotTestImagesFolder}/baseline.png`;
        const hash = await snapshotComparator.generateHashes(snapshot);

        expect(hash).toBeDefined();
    });

    it("should be similar for the same image", async () => {
        const snapshot = `${snapShotTestImagesFolder}/baseline.png`;
        const hash = await snapshotComparator.generateHashes(snapshot);
        const isSimilar = await snapshotComparator.compareSnapshot(snapshot, hash, 0.1);
        expect(isSimilar).toBeTruthy();
    });

    it("should not be similar for different images and low threshold", async () => {
        const snapshot1 = `${snapShotTestImagesFolder}/baseline.png`;
        const snapshot2 = `${snapShotTestImagesFolder}/very_different.webp`;
        const hash1 = await snapshotComparator.generateHashes(snapshot1);
        const hash2 = await snapshotComparator.generateHashes(snapshot2);
        const isSimilar = await snapshotComparator.compareSnapshot(snapshot2, hash1, 0.1);
        
        expect(hash2).not.toEqual(hash1);
        expect(isSimilar).toBeFalsy();
    });
});