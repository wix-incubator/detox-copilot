import fs from "fs";
import path from "path";

export const CACHE_FILE_NAME = 'test_cache.json';
const CACHE_FILE_PATH = path.resolve(process.cwd(), CACHE_FILE_NAME);

export let mockedCacheFile: { [key: string]: any } | undefined;

export const mockCache = (data: { [key: string]: any } | undefined = undefined) => {
    mockedCacheFile = data;

    (fs.writeFileSync as jest.Mock).mockImplementation((filePath, data) => {
        if (filePath === CACHE_FILE_PATH) {
            mockedCacheFile = JSON.parse(data);
        }
    });

    (fs.readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify(mockedCacheFile));

    (fs.existsSync as jest.Mock).mockReturnValue(mockedCacheFile !== undefined);
};
