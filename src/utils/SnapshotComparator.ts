import type { HashingAlgorithm, SnapshotHashing, SnapShotHashObject } from "@/types";
import { BlockHash } from "@/utils/snapshotHashing/BlockHash";
import { pHash } from "@/utils/snapshotHashing/pHash";

export class SnapshotComparator {
    private readonly hashingComparators: Map<HashingAlgorithm, SnapshotHashing> = new Map();

    constructor() {
        this.hashingComparators.set("BlockHash", new BlockHash(16));
        this.hashingComparators.set('PHash', new pHash());
    }

    public async generateHashes(snapshot: any): Promise<SnapShotHashObject> {
        const hashes: SnapShotHashObject = {
            BlockHash: '',
            PHash: '',
        };
        for (const [algorithm, comparator] of this.hashingComparators) {
            hashes[algorithm] =  await comparator.hashSnapshot(snapshot);
        }
        return hashes;
    }

    public async compareSnapshot(snapshot: any , hashes: SnapShotHashObject, trashload?: number): Promise<Boolean> {
        for (const [algorithm, hash] of Object.entries(hashes)) {
            // @ts-ignore
            const comparator = this.hashingComparators.get(algorithm);
            if (!await comparator?.areSnapshotsSimilar(hash, await comparator.hashSnapshot(snapshot), trashload)) {
                return false;
            }
        }
        return true;
    }
}