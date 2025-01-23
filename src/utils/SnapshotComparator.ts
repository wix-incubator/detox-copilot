import type { HashingAlgorithm, SnapshotHashing, SnapshotHashObject } from "@/types";
import { BlockHash } from "@/utils/snapshotHashing/BlockHash";
import { pHash } from "@/utils/snapshotHashing/pHash";

export class SnapshotComparator {
    private readonly hashingComparators: Map<HashingAlgorithm, SnapshotHashing> = new Map();

    constructor() {
        this.hashingComparators.set("BlockHash", new BlockHash(16));
        this.hashingComparators.set('PHash', new pHash());
    }

    public async generateHashes(snapshot: any): Promise<SnapshotHashObject> {
        const hashPromises = Array.from(this.hashingComparators.entries()).map(async ([algorithm, comparator]) => {
            const hash = await comparator.hashSnapshot(snapshot);
            return [algorithm, hash] as [HashingAlgorithm, string];
        });

        const hashEntries = await Promise.all(hashPromises);
        return Object.fromEntries(hashEntries) as SnapshotHashObject;
    }

    public async compareSnapshot(snapshot: SnapshotHashObject , hashes: SnapshotHashObject, trashload?: number): Promise<Boolean> {
        const comparisonPromises = Object.entries(hashes).map(async ([algorithm, hash]) => {
            const comparator = this.hashingComparators.get(algorithm as HashingAlgorithm);
            return await comparator?.areSnapshotsSimilar(hash, snapshot[algorithm as HashingAlgorithm], trashload);
        });

        const comparisonResults = await Promise.all(comparisonPromises);
        return comparisonResults.every(isSimilar => isSimilar);
    }
}