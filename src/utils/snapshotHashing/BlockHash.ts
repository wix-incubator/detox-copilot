import { SnapshotHashing } from "@/utils/snapshotHashing/SnapshotHashing";
import { imageHash } from "image-hash";

export class BlockHash implements SnapshotHashing {
  constructor(private bits: number = 16) {}

  hashSnapshot(snapshot: any): Promise<string> {
    return new Promise((resolve, reject) => {
      imageHash(snapshot, this.bits, true, (error: any, data: any) => {
        if (error) {
          reject(`Error hashing snapshot: ${error}`);
        } else {
          resolve(data);
        }
      });
    });
  }

  calculateSnapshotDistance(snapshot1: string, snapshot2: string): number {
    if (snapshot1.length !== snapshot2.length) {
      throw new Error("Snapshot lengths do not match");
    }

    let distance = 0;
    for (let i = 0; i < snapshot1.length; i++) {
      if (snapshot1[i] !== snapshot2[i]) {
        distance++;
      }
    }

    return distance;
  }

  areSnapshotsSimilar(
    snapshot1: string,
    snapshot2: string,
    threshold: number
  ): boolean {
    const diff = this.calculateSnapshotDistance(snapshot1, snapshot2);
    const distance = diff / snapshot1.length;

    return distance <= threshold;
  }
}
