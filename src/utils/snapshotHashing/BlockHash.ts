import {SnapshotHashing} from "@/types";
import {bmvbhash} from "blockhash-core";

const { createCanvas, loadImage } = require('canvas');

export class BlockHash implements SnapshotHashing {
  constructor(private bits: number = 16) {}

  async hashSnapshot(snapshot: any): Promise<string> {
    const snapshotData = await this.getImageData(snapshot);
    return bmvbhash(snapshotData, this.bits);
  }

  private async getImageData(filePath: string): Promise<ImageData> {
    try {
      // Load the image using the local file path
      const image = await loadImage(filePath);

      // Create a canvas with the dimensions of the image
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      // Draw the image onto the canvas
      ctx.drawImage(image, 0, 0);

      // Retrieve the ImageData from the canvas (x, y, width, height)
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
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
    threshold: number = 0.1
  ): boolean {
    const diff = this.calculateSnapshotDistance(snapshot1, snapshot2);
    const distance = diff / snapshot1.length;

    return distance <= threshold;
  }
}
