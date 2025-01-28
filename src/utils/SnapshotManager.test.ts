import { SnapshotManager } from "./SnapshotManager";
import { TestingFrameworkDriver } from "@/types";
import { SnapshotComparator } from "./SnapshotComparator";
import crypto from "crypto";
import gm from "gm";

jest.mock("crypto", () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(),
  }),
}));

jest.mock("gm", () => {
  const resizeMock: jest.Mock = jest.fn().mockReturnThis();
  const writeMock = jest.fn(
    (outputPath: string, callback: (error: Error | null) => void) => {
      callback(null);
    },
  );

  const gmMock = jest.fn(() => ({
    resize: resizeMock,
    write: writeMock,
  }));

  (gmMock as any).resizeMock = resizeMock;
  (gmMock as any).writeMock = writeMock;

  return gmMock;
});
const gmMock = gm as unknown as jest.Mock & {
  resizeMock: jest.MockedFunction<any>;
  writeMock: jest.MockedFunction<any>;
};

describe("SnapshotManager", () => {
  let mockDriver: jest.Mocked<TestingFrameworkDriver>;
  let mockSnapshotComparator: jest.Mocked<SnapshotComparator>;
  let snapshotManager: SnapshotManager;

  beforeEach(() => {
    mockDriver = {
      captureSnapshotImage: jest.fn(),
      captureViewHierarchyString: jest.fn(),
    } as any;

    mockSnapshotComparator = {
      generateHashes: jest.fn(),
      compareSnapshot: jest.fn(),
    } as any;

    snapshotManager = new SnapshotManager(mockDriver, mockSnapshotComparator);

    // Mock timers
    jest.useFakeTimers();

    // Clear mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("captureSnapshotImage", () => {
    it("should return stable snapshot when UI becomes stable", async () => {
      const snapshots = [
        "/path/to/snapshot1.png",
        "/path/to/snapshot2.png",
        "/path/to/snapshot2.png",
      ];
      let callCount = 0;

      mockDriver.captureSnapshotImage.mockImplementation(async () => {
        return snapshots[callCount++];
      });

      const imagePathToHash: { [key: string]: string } = {
        "/path/to/snapshot1.png": "hash1",
        "/path/to/snapshot2.png": "hash2",
      };

      mockSnapshotComparator.generateHashes.mockImplementation(
        async (snapshot: string) => {
          return { BlockHash: imagePathToHash[snapshot] };
        },
      );

      mockSnapshotComparator.compareSnapshot.mockImplementation(
        (hash1, hash2) => {
          return hash1.BlockHash === hash2.BlockHash;
        },
      );

      const capturePromise = snapshotManager.captureSnapshotImage(100);

      // Fast-forward time to trigger the first two different snapshots
      await jest.advanceTimersByTimeAsync(200);

      // Fast-forward to get the stable snapshot
      await jest.advanceTimersByTimeAsync(100);

      const result = await capturePromise;

      expect(result).toBe("/path/to/snapshot2.png");
      expect(mockDriver.captureSnapshotImage).toHaveBeenCalledTimes(3);
      expect(mockSnapshotComparator.generateHashes).toHaveBeenCalledTimes(4);
      expect(mockSnapshotComparator.compareSnapshot).toHaveBeenCalledTimes(2);

      // Verify that gm was called with correct parameters
      expect(gmMock).toHaveBeenCalledTimes(3);
      expect(gmMock).toHaveBeenNthCalledWith(1, "/path/to/snapshot1.png");
      expect(gmMock).toHaveBeenNthCalledWith(2, "/path/to/snapshot2.png");
      expect(gmMock).toHaveBeenNthCalledWith(3, "/path/to/snapshot2.png");
      expect(gmMock.resizeMock).toHaveBeenCalledTimes(3);
      expect(gmMock.resizeMock).toHaveBeenCalledWith(800);
      expect(gmMock.writeMock).toHaveBeenCalledTimes(3);
    });

    it("should return last snapshot when timeout is reached", async () => {
      const snapshots = [
        "/path/to/snapshot1.png",
        "/path/to/snapshot2.png",
        "/path/to/snapshot3.png",
        "/path/to/snapshot4.png",
      ];
      let callCount = 0;

      mockDriver.captureSnapshotImage.mockImplementation(async () => {
        return snapshots[callCount++];
      });

      const imagePathToHash: { [key: string]: string } = {
        "/path/to/snapshot1.png": "hash1",
        "/path/to/snapshot2.png": "hash2",
        "/path/to/snapshot3.png": "hash3",
        "/path/to/snapshot4.png": "hash4",
      };

      mockSnapshotComparator.generateHashes.mockImplementation(
        async (snapshot: string) => {
          return { BlockHash: imagePathToHash[snapshot] };
        },
      );

      mockSnapshotComparator.compareSnapshot.mockReturnValue(false);

      const capturePromise = snapshotManager.captureSnapshotImage(100, 250);

      // Fast-forward past the timeout
      await jest.advanceTimersByTimeAsync(300);

      const result = await capturePromise;

      expect(result).toBe("/path/to/snapshot3.png");
      expect(mockDriver.captureSnapshotImage).toHaveBeenCalledTimes(3);

      // Verify that gm was called
      expect(gmMock).toHaveBeenCalledTimes(3);
      expect(gmMock.resizeMock).toHaveBeenCalledTimes(3);
      expect(gmMock.writeMock).toHaveBeenCalledTimes(3);
    });

    it("should handle undefined snapshots", async () => {
      mockDriver.captureSnapshotImage.mockResolvedValue(undefined);

      const result = await snapshotManager.captureSnapshotImage();

      expect(result).toBeUndefined();
      expect(mockDriver.captureSnapshotImage).toHaveBeenCalledTimes(1);
      expect(mockSnapshotComparator.generateHashes).not.toHaveBeenCalled();
      expect(gmMock).not.toHaveBeenCalled();
    });
  });

  describe("captureViewHierarchyString", () => {
    it("should return stable view hierarchy when UI becomes stable", async () => {
      const hierarchies = [
        "<view>1</view>",
        "<view>2</view>",
        "<view>2</view>",
      ];
      let callCount = 0;

      mockDriver.captureViewHierarchyString.mockImplementation(async () => {
        return hierarchies[callCount++];
      });

      const mockDigest = jest.fn();
      mockDigest
        .mockReturnValueOnce("hash1")
        .mockReturnValueOnce("hash2")
        .mockReturnValueOnce("hash2")
        .mockReturnValueOnce("hash2");

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: mockDigest,
      });

      const capturePromise = snapshotManager.captureViewHierarchyString(100);

      // Fast-forward time to trigger the first two different hierarchies
      await jest.advanceTimersByTimeAsync(200);

      // Fast-forward to get the stable hierarchy
      await jest.advanceTimersByTimeAsync(100);

      const result = await capturePromise;

      expect(result).toBe("<view>2</view>");
      expect(mockDriver.captureViewHierarchyString).toHaveBeenCalledTimes(3);
      expect(crypto.createHash).toHaveBeenCalledWith("md5");
      expect(mockDigest).toHaveBeenCalledTimes(4);
    });

    it("should handle empty view hierarchy", async () => {
      mockDriver.captureViewHierarchyString.mockResolvedValue("");

      const result = await snapshotManager.captureViewHierarchyString();

      expect(result).toBe("");
      expect(mockDriver.captureViewHierarchyString).toHaveBeenCalledTimes(1);
      expect(crypto.createHash).not.toHaveBeenCalled();
    });
  });
});
