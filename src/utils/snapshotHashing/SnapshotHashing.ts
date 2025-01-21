export interface SnapshotHashing {
    hashSnapshot(snapshot: any): Promise<string>;

    calculateSnapshotDistance(hash1: string, hash2: string): number;

    areSnapshotsSimilar(snapshot1: string, snapshot2: string, threshold: number): boolean;
}