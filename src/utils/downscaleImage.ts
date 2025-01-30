import gm from "gm";
import logger from "./logger";
import path from "path";
import os from "os";

const MAX_PIXELS = 2000000;

async function downscaleImage(imagePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const parsedPath = path.parse(imagePath);
    parsedPath.dir = os.tmpdir();
    parsedPath.name += "_downscaled";
    parsedPath.base = parsedPath.name + parsedPath.ext;
    const downscaledPath = path.format(parsedPath);
    gm(imagePath).size(function (
      err: any,
      size: { width: number; height: number },
    ) {
      if (err) {
        logger.error({
          message: `Error getting image size: ${err}`,
          isBold: false,
          color: "gray",
        });
        reject(err);
      } else {
        const originalWidth = size.width;
        const originalHeight = size.height;
        const originalTotalPixels = originalWidth * originalHeight;

        if (originalTotalPixels <= MAX_PIXELS) {
          resolve(imagePath);
        } else {
          const aspectRatio = originalWidth / originalHeight;
          const newHeight = Math.sqrt(MAX_PIXELS / aspectRatio);
          const newWidth = newHeight * aspectRatio;
          const roundedWidth = Math.round(newWidth);
          const roundedHeight = Math.round(newHeight);

          gm(imagePath)
            .resize(roundedWidth, roundedHeight)
            .write(downscaledPath, (err: any) => {
              if (err) {
                logger.error({
                  message: `Error writing downscaled image: ${err}`,
                  isBold: false,
                  color: "gray",
                });
                reject(err);
              } else {
                resolve(downscaledPath);
              }
            });
        }
      }
    });
  });
}

export default downscaleImage;
