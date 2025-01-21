import type { HashingAlgorithm } from "@/types";
import { BlockHash } from "@/utils/snapshotHashing/BlockHash";
import { pHash } from "@/utils/snapshotHashing/pHash";
import {type SnapshotHashing } from "@/utils/snapshotHashing/SnapshotHashing";

export class SnapshotComparator {
    private readonly hashingComparators: Map<HashingAlgorithm, SnapshotHashing> = new Map();

    constructor() {
        this.hashingComparators.set("BlockHash", new BlockHash(16));
        this.hashingComparators.set('PHash', new pHash());
    }

    public async generateHashes(snapshot: any): Promise<Record<HashingAlgorithm, string>> {
        const hashes:Record<HashingAlgorithm, string> = {
            BlockHash: '',
            PHash: '',
        };
        for (const [algorithm, comparator] of this.hashingComparators) {
            hashes[algorithm] =  await comparator.hashSnapshot(snapshot);
        }
        return hashes;
    }

    public async compareSnapshot(snapshot: any , hashes:Record<HashingAlgorithm, string>, trashload:number): Promise<Boolean> {
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