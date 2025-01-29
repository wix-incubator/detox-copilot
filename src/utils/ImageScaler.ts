import gm from "gm";
const MAX_PIXELS = 2000000;

export async function downscaleImage(imagePath: string): Promise<string> {
return new Promise<string>((resolve, reject) => {
    gm(imagePath)
    .size(function (err: any, size: { width: number; height: number }) {
        if (err) {
        console.error("Error getting image size:", err);
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
                .write(imagePath, (err: any) => {
                if (err) {
                console.error("Error downscaling image:", err);
                reject(err);
                } else {
                resolve(imagePath);
                }
            });
        }
        }
    });
});
}
