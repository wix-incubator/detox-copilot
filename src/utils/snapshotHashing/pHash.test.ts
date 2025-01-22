
import { pHash } from "./pHash";
import {getSnapshotImage} from "@/test-utils/SnapshotComparatorTestImages/SnapshotImageGetter";

describe("pHash algorithm", () => {
    const snapshotComparator = new pHash();
    it("should hash a snapshot", async () => {
        const snapshot = getSnapshotImage("baseline");
        const hash = await snapshotComparator.hashSnapshot(snapshot);
  
        expect(hash).toBeDefined();
      });
  
      it("should return similar for the same image", async () => {
        const snapshot = getSnapshotImage("baseline");
        const hash = await snapshotComparator.hashSnapshot(snapshot);
        const hash2 = await snapshotComparator.hashSnapshot(snapshot);
        const similar = await snapshotComparator.areSnapshotsSimilar(
          hash,
          hash2,
          0.1
        );
        expect(similar).toBe(true);
      });
  
      it("should return not similar for different images and low threshold", async () => {
        const snapshot1 = getSnapshotImage("baseline");
        const snapshot2 = getSnapshotImage("different");
        const hash1 = await snapshotComparator.hashSnapshot(snapshot1);
        const hash2 = await snapshotComparator.hashSnapshot(snapshot2);
        const similar = await snapshotComparator.areSnapshotsSimilar(
          hash1,
          hash2,
          0.1
        );
        expect(similar).toBe(false);
      });
  
      it("should return not similar for different images and medium threshold", async () => {
        const snapshot1 = getSnapshotImage("baseline");
        const snapshot2 = getSnapshotImage("different");
        const hash1 = await snapshotComparator.hashSnapshot(snapshot1);
        const hash2 = await snapshotComparator.hashSnapshot(snapshot2);
        const similar = await snapshotComparator.areSnapshotsSimilar(
          hash1,
          hash2,
          0.5
        );
        expect(hash1).not.toEqual(hash2);
        expect(similar).toBe(false);
      });
}); 
