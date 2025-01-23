import fs from "fs";

export let mockedCacheFile: { [key: string]: any } | undefined;

export const mockCache = (
  data: { [key: string]: any } | undefined = undefined,
) => {
  mockedCacheFile = data;

  (fs.writeFileSync as jest.Mock).mockImplementation((filePath, data) => {
    mockedCacheFile = JSON.parse(data);
  });

  (fs.readFileSync as jest.Mock).mockReturnValue(
    JSON.stringify(mockedCacheFile),
  );

  (fs.existsSync as jest.Mock).mockReturnValue(mockedCacheFile !== undefined);
};
