import path from "path";

type image = "baseline" | "very_different" | "different";
const imageFileNames: Record<image, string> = {
    baseline: 'baseline.png',
    very_different: 'very_different.png',
    different: 'different.png',
};

export const getSnapshotImage = (image: image) => {
    return path.resolve(
        __dirname,
        '.',
        imageFileNames[image]
    )
};

