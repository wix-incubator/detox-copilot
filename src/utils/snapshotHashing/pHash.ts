import type { SnapshotHashing } from "./SnapshotHashing";
import phash from 'sharp-phash';
import distance from 'sharp-phash/distance';

export class pHash implements SnapshotHashing{
    hashSnapshot(snapshot: any): Promise<string> {
        return phash(snapshot);
    }

    calculateSnapshotDistance(snapshot1: string, snapshot2: string): number {
        return distance(snapshot1, snapshot2);
    }
    areSnapshotsSimilar(snapshot1: string, snapshot2: string, threshold: number): boolean {
        const diff = this.calculateSnapshotDistance(snapshot1, snapshot2);
        const distance = diff / snapshot1.length;
        console.log('yohai - phash - distance:', distance);
        
        return distance <= threshold;
    }

}