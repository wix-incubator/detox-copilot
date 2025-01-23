import type { HashingAlgorithm, SnapshotHashing, SnapshotHashObject } from "@/types";
import { BlockHash } from "@/utils/snapshotHashing/BlockHash";


export class SnapshotComparator {
    private readonly hashingAlgorithms: Map<HashingAlgorithm, SnapshotHashing> = new Map();

    constructor() {
        this.hashingAlgorithms.set("BlockHash", new BlockHash(16));
    }

    public async generateHashes(snapshot: any): Promise<SnapshotHashObject> {
        const hashPromises = Array.from(this.hashingAlgorithms.entries()).map(async ([algorithm, comparator]) => {
            const hash = await comparator.hashSnapshot(snapshot);
            return [algorithm, hash] as [HashingAlgorithm, string];
        });

        const hashEntries = await Promise.all(hashPromises);
        return Object.fromEntries(hashEntries) as SnapshotHashObject;
    }

    public compareSnapshot(newSnapshot: SnapshotHashObject , cachedSnapshot: SnapshotHashObject, trashload?: number): Boolean {
        const comparisonPromises = Object.entries(cachedSnapshot).map(([algorithmName, hash]) => {
            const algorithm = this.hashingAlgorithms.get(algorithmName as HashingAlgorithm);
            return algorithm?.areSnapshotsSimilar(hash, newSnapshot[algorithmName as HashingAlgorithm], trashload);
        });

        return comparisonPromises.every(isSimilar => isSimilar);
    }
}