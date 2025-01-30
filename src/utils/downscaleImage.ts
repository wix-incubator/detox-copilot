import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import os from "os";
import logger from "./logger";

const MAX_PIXELS = 2000000;

async function downscaleImage(imagePath: string): Promise<string> {
  try {
    const img = await loadImage(imagePath);

    const originalWidth = img.width;
    const originalHeight = img.height;
    const originalTotalPixels = originalWidth * originalHeight;

    if (originalTotalPixels <= MAX_PIXELS) {
      return imagePath;
    } else {
      const aspectRatio = originalWidth / originalHeight;
      const newHeight = Math.sqrt(MAX_PIXELS / aspectRatio);
      const newWidth = newHeight * aspectRatio;
      const roundedWidth = Math.round(newWidth);
      const roundedHeight = Math.round(newHeight);

      const canvas = createCanvas(roundedWidth, roundedHeight);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, roundedWidth, roundedHeight);

      const parsedPath = path.parse(imagePath);
      parsedPath.dir = os.tmpdir();
      parsedPath.name += "_downscaled";
      parsedPath.ext = ".png";
      const downscaledPath = path.format(parsedPath);
      const out = fs.createWriteStream(downscaledPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      await new Promise<void>((resolve, reject) => {
        out.on("finish", () => resolve());
        out.on("error", (err) => reject(err));
      });

      return downscaledPath;
    }
  } catch (err) {
    logger.error({
      message: `Error getting image size: ${err}`,
      isBold: false,
      color: "gray",
    });
    throw new Error(`Error processing image: ${err}`);
  }
}

export default downscaleImage;
