import path from "path";

type image = "baseline" | "different";
const imageFileNames: Record<image, string> = {
    baseline: 'baseline.png',
    different: 'different.png',
};

export const getSnapshotImage = (image: image) => {
    return path.resolve(
        __dirname,
        '.',
        imageFileNames[image]
    )
};

