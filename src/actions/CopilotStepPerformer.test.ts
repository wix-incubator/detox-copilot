import { CopilotStepPerformer } from '@/actions/CopilotStepPerformer';
import { PromptCreator } from '@/utils/PromptCreator';
import { CodeEvaluator } from '@/utils/CodeEvaluator';
import { SnapshotManager } from '@/utils/SnapshotManager';
import { CacheHandler } from '@/utils/CacheHandler';
import { SnapshotComparator } from '@/utils/SnapshotComparator';
import { PromptHandler, TestingFrameworkAPICatalog, ScreenCapturerResult, PreviousStep, CacheMode } from '@/types';
import * as crypto from 'crypto';
import { dummyContext, dummyBarContext1, dummyBarContext2 } from '../test-utils/APICatalogTestUtils';

jest.mock('fs');
jest.mock('crypto');

const INTENT = 'tap button';
const VIEW_HIERARCHY = '<view></view>';
const PROMPT_RESULT = 'generated code';
const CODE_EVALUATION_RESULT = 'success';
const SNAPSHOT_DATA = 'snapshot_data';
const VIEW_HIERARCHY_HASH = 'hash';
const CACHE_VALUE = [{code: PROMPT_RESULT, viewHierarchy: VIEW_HIERARCHY_HASH}];
const CACHE_KEY = JSON.stringify({ step: INTENT, previous: [], viewHierarchyHash: VIEW_HIERARCHY_HASH });

describe('CopilotStepPerformer', () => {
  let copilotStepPerformer: CopilotStepPerformer;
  let mockContext: jest.Mocked<any>;
  let mockPromptCreator: jest.Mocked<PromptCreator>;
  let mockCodeEvaluator: jest.Mocked<CodeEvaluator>;
  let mockSnapshotManager: jest.Mocked<SnapshotManager>;
  let mockPromptHandler: jest.Mocked<PromptHandler>;
  let mockCacheHandler: jest.Mocked<CacheHandler>;
  let mockSnapshotComparator: jest.Mocked<SnapshotComparator>;
  let uuidCounter = 0;

  beforeEach(() => {
    jest.resetAllMocks();
    uuidCounter = 0;
        (crypto.randomUUID as jest.Mock).mockImplementation(() => `uuid-${uuidCounter++}`);
    const apiCatalog: TestingFrameworkAPICatalog = {
      context: {},
      categories: [],
    };

    mockContext = {} as jest.Mocked<any>;

    // Create mock instances of dependencies
    mockPromptCreator = {
      apiCatalog: apiCatalog,
      createPrompt: jest.fn(),
      createBasePrompt: jest.fn(),
      createContext: jest.fn(),
      createAPIInfo: jest.fn(),
    } as unknown as jest.Mocked<PromptCreator>;

    mockCodeEvaluator = {
      evaluate: jest.fn(),
    } as unknown as jest.Mocked<CodeEvaluator>;

    mockSnapshotManager = {
      captureSnapshotImage: jest.fn(),
      captureViewHierarchyString: jest.fn(),
    } as unknown as jest.Mocked<SnapshotManager>;

    mockPromptHandler = {
      runPrompt: jest.fn(),
      isSnapshotImageSupported: jest.fn(),
    } as jest.Mocked<PromptHandler>;

    mockCacheHandler = {
      loadCacheFromFile: jest.fn(),
      saveCacheToFile: jest.fn(),
      existInCache: jest.fn(),
      addToTemporaryCache: jest.fn(),
      flushTemporaryCache: jest.fn(),
      clearTemporaryCache: jest.fn(),
      getStepFromCache: jest.fn(),
    } as unknown as jest.Mocked<CacheHandler>;

    mockSnapshotComparator = {
      generateHashes: jest.fn(),
      compareSnapshot: jest.fn(),
    } as unknown as jest.Mocked<SnapshotComparator>;

    copilotStepPerformer = new CopilotStepPerformer(
      mockContext,
      mockPromptCreator,
      mockCodeEvaluator,
      mockSnapshotManager,
      mockPromptHandler,
      mockCacheHandler,
      mockSnapshotComparator,
    );
  });

  interface SetupMockOptions {
    isSnapshotSupported?: boolean;
    snapshotData?: string | null;
    viewHierarchy?: string;
    promptResult?: string;
    codeEvaluationResult?: any;
    cacheExists?: boolean;
    overrideCache?: boolean;
    previous?: PreviousStep[];
    intent?: string;
  }

  const setupMocks = ({
    isSnapshotSupported = true,
    snapshotData = SNAPSHOT_DATA,
    viewHierarchy = VIEW_HIERARCHY,
    promptResult = PROMPT_RESULT,
    codeEvaluationResult = CODE_EVALUATION_RESULT,
    cacheExists = false,
    overrideCache = false,
    previous = [],
    intent = INTENT,
  }: SetupMockOptions = {}) => {
    mockPromptHandler.isSnapshotImageSupported.mockReturnValue(isSnapshotSupported);
    mockSnapshotManager.captureSnapshotImage.mockResolvedValue(snapshotData != null ? snapshotData : undefined);
    mockSnapshotManager.captureViewHierarchyString.mockResolvedValue(viewHierarchy);
    mockPromptCreator.createPrompt.mockReturnValue('generated prompt');
    mockPromptHandler.runPrompt.mockResolvedValue(promptResult);
    mockCodeEvaluator.evaluate.mockResolvedValue(codeEvaluationResult);

    if (overrideCache) {
      process.env.COPILOT_OVERRIDE_CACHE = 'true';
    } else {
      process.env.COPILOT_OVERRIDE_CACHE = 'false';
    }

    const viewHierarchyHash = 'hash';
    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({
        digest: jest.fn().mockReturnValue(viewHierarchyHash),
      }),
    });

    const cacheKey = JSON.stringify({
      step: intent,
      previous: previous,
      // viewHierarchyHash: viewHierarchyHash,
    });

    if (cacheExists) {
      const cacheData: Map<string, any> = new Map();
      cacheData.set(cacheKey, CACHE_VALUE);

      mockCacheHandler.getStepFromCache.mockImplementation((key: string) => {
        return cacheData.get(key);
      });
    } else {
      mockCacheHandler.getStepFromCache.mockReturnValue(undefined);
    }
  };

  it('should perform an intent successfully with snapshot image support', async () => {
    setupMocks();

    const screenCapture: ScreenCapturerResult = {
      snapshot: SNAPSHOT_DATA,
      viewHierarchy: VIEW_HIERARCHY,
      isSnapshotImageAttached: true,
    };

    const result = await copilotStepPerformer.perform(INTENT, [], screenCapture, 2);

    expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
    expect(result).toBe('success');
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(INTENT, VIEW_HIERARCHY, true, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', SNAPSHOT_DATA);
    expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, mockContext);
    expect(mockCacheHandler.getStepFromCache).toHaveBeenCalled();
    expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalled();
  });

  it('should perform an intent successfully without snapshot image support', async () => {
    setupMocks({ isSnapshotSupported: false });

    const screenCapture: ScreenCapturerResult = {
      snapshot: undefined,
      viewHierarchy: VIEW_HIERARCHY,
      isSnapshotImageAttached: false,
    };

    const result = await copilotStepPerformer.perform(INTENT, [], screenCapture, 2);

    expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
    expect(result).toBe('success');
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(INTENT, VIEW_HIERARCHY, false, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', undefined);
    expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, mockContext);
    expect(mockCacheHandler.getStepFromCache).toHaveBeenCalled();
    expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalled();
  });

  it('should perform an intent with undefined snapshot', async () => {
    setupMocks({ snapshotData: null });

    const screenCapture: ScreenCapturerResult = {
      snapshot: undefined,
      viewHierarchy: VIEW_HIERARCHY,
      isSnapshotImageAttached: false,
    };

    const result = await copilotStepPerformer.perform(INTENT, [], screenCapture, 2);

    expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
    expect(result).toBe('success');
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(INTENT, VIEW_HIERARCHY, false, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', undefined);
    expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, mockContext);
    expect(mockCacheHandler.getStepFromCache).toHaveBeenCalled();
    expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalled();
  });

  it('should perform an intent successfully with previous intents', async () => {
    const intent = 'current intent';
    const previousIntents: PreviousStep[] = [
      {
        step: 'previous intent',
        code: 'previous code',
        result: 'previous result',
      },
    ];

    setupMocks({ previous: previousIntents, intent });

    const screenCapture: ScreenCapturerResult = {
      snapshot: SNAPSHOT_DATA,
      viewHierarchy: VIEW_HIERARCHY,
      isSnapshotImageAttached: true,
    };

    const result = await copilotStepPerformer.perform(intent, previousIntents, screenCapture, 2);

    expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
    expect(result).toBe('success');
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(intent, VIEW_HIERARCHY, true, previousIntents);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', SNAPSHOT_DATA);
    expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, mockContext);
    expect(mockCacheHandler.getStepFromCache).toHaveBeenCalled();
    expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalled();
  });

  it('should throw an error if code evaluation fails', async () => {
    setupMocks();
    mockCodeEvaluator.evaluate.mockRejectedValue(new Error('Evaluation failed'));

    const screenCapture: ScreenCapturerResult = {
      snapshot: SNAPSHOT_DATA,
      viewHierarchy: VIEW_HIERARCHY,
      isSnapshotImageAttached: true,
    };

    await expect(copilotStepPerformer.perform(INTENT, [], screenCapture, 2)).rejects.toThrow('Evaluation failed');
    expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalled();
  });

  it('should use cached prompt result if available', async () => {
    setupMocks({ cacheExists: true });

    const screenCapture: ScreenCapturerResult = {
      snapshot: SNAPSHOT_DATA,
      viewHierarchy: VIEW_HIERARCHY,
      isSnapshotImageAttached: true,
    };

    const result = await copilotStepPerformer.perform(INTENT, [], screenCapture, 2);

    expect(result).toBe('success');
    expect(mockCacheHandler.getStepFromCache).toHaveBeenCalled();
    // Should not call runPrompt or createPrompt since result is cached
    expect(mockPromptCreator.createPrompt).not.toHaveBeenCalled();
    expect(mockPromptHandler.runPrompt).not.toHaveBeenCalled();
    expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, mockContext);
    expect(mockCacheHandler.addToTemporaryCache).not.toHaveBeenCalled(); // No need to save cache again
  });

  it('should retry if initial runPrompt throws an error and succeed on retry', async () => {
    setupMocks();
    const error = new Error('Initial prompt failed');
    mockPromptHandler.runPrompt.mockRejectedValueOnce(error);
    // On retry, it succeeds
    mockPromptHandler.runPrompt.mockResolvedValueOnce('retry generated code');

    const screenCapture: ScreenCapturerResult = {
      snapshot: SNAPSHOT_DATA,
      viewHierarchy: VIEW_HIERARCHY,
      isSnapshotImageAttached: true,
    };

    const result = await copilotStepPerformer.perform(INTENT, [], screenCapture, 2);

    expect(result).toBe('success');
    expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledTimes(2);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledTimes(2);
    expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith('retry generated code', mockContext);
    expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalledTimes(1); // Cache should be saved after success
  });

  it('should throw original error if retry also fails', async () => {
    setupMocks();
    const error = new Error('Initial prompt failed');
    const retryError = new Error('Retry prompt failed');
    mockPromptHandler.runPrompt.mockRejectedValueOnce(error);
    mockPromptHandler.runPrompt.mockRejectedValueOnce(retryError);

    const screenCapture: ScreenCapturerResult = {
      snapshot: SNAPSHOT_DATA,
      viewHierarchy: VIEW_HIERARCHY,
      isSnapshotImageAttached: true,
    };

    await expect(copilotStepPerformer.perform(INTENT, [], screenCapture, 2)).rejects.toThrow(retryError);
    expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledTimes(2);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledTimes(2);
    expect(mockCodeEvaluator.evaluate).not.toHaveBeenCalled();
    expect(mockCacheHandler.addToTemporaryCache).not.toHaveBeenCalled();
  });

  it('should not use cached prompt result if COPILOT_OVERRIDE_CACHE is enabled', async () => {
    const intent = 'tap button';
    setupMocks({ cacheExists: true, overrideCache: true, intent });

    const screenCapture: ScreenCapturerResult = {
      snapshot: SNAPSHOT_DATA,
      viewHierarchy: VIEW_HIERARCHY,
      isSnapshotImageAttached: true,
    };

    const result = await copilotStepPerformer.perform(intent, [], screenCapture, 2);

    expect(result).toBe('success');
    // Should call runPrompt and createPrompt. Shouldn't use current cache but override it
    expect(mockPromptCreator.createPrompt).toHaveBeenCalled();
    expect(mockPromptHandler.runPrompt).toHaveBeenCalled();
    expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, mockContext);
    expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalled();
  });

  describe('extendJSContext', () => {
    it('should extend the context with the given object', async () => {
      // Initial context
      copilotStepPerformer.extendJSContext(dummyBarContext1);

      setupMocks();
      const screenCapture: ScreenCapturerResult = {
        snapshot: SNAPSHOT_DATA,
        viewHierarchy: VIEW_HIERARCHY,
        isSnapshotImageAttached: true,
      };

      await copilotStepPerformer.perform(INTENT, [], screenCapture, 2);
      expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, dummyBarContext1);

      // Extended context
      const extendedContext = { ...dummyBarContext1, ...dummyContext };
      copilotStepPerformer.extendJSContext(dummyContext);

      await copilotStepPerformer.perform(INTENT, [], screenCapture, 2);
      expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, extendedContext);
    });

    it('should log when a context key is overridden', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      copilotStepPerformer.extendJSContext(dummyBarContext1);

      setupMocks();
      const screenCapture: ScreenCapturerResult = {
        snapshot: SNAPSHOT_DATA,
        viewHierarchy: VIEW_HIERARCHY,
        isSnapshotImageAttached: true,
      };

      await copilotStepPerformer.perform(INTENT, [], screenCapture, 2);
      expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, dummyBarContext1);

      copilotStepPerformer.extendJSContext(dummyBarContext2);
      expect(console.log).toHaveBeenCalledWith('Notice: Context bar is overridden by the new context value');

      await copilotStepPerformer.perform(INTENT, [], screenCapture, 2);
      expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, dummyBarContext2);
    });
  });
  describe('cache modes', () => {
    const testCacheModes = async (cacheMode: CacheMode) => {
        const generatedKeys: string[] = [];
        mockCacheHandler.addToTemporaryCache.mockImplementation((key: string) => {
            generatedKeys.push(key);
        });

        copilotStepPerformer = new CopilotStepPerformer(
            mockContext,
            mockPromptCreator,
            mockCodeEvaluator,
            mockSnapshotManager,
            mockPromptHandler,
            mockCacheHandler,
            mockSnapshotComparator,
            cacheMode
        );
        const screenCapture: ScreenCapturerResult = {
            snapshot: SNAPSHOT_DATA,
            viewHierarchy: VIEW_HIERARCHY,
            isSnapshotImageAttached: true,
          }; 

        setupMocks({
            promptResult: '```\nconst code = true;\n```',
            codeEvaluationResult: 'success'
        });
        await copilotStepPerformer.perform(INTENT, [], screenCapture, undefined);
        return generatedKeys[0];
    };

    // it('should include view hierarchy hash in cache key when mode is full', async () => {
    //     const cacheKey = await testCacheModes('full');
    //     const parsedKey = JSON.parse(cacheKey);
    //     expect(parsedKey).toHaveProperty('viewHierarchyHash');
    //     expect(parsedKey.viewHierarchyHash).toBe('hash');
    // });

    it('should not include view hierarchy hash in cache key when mode is lightweight', async () => {
        const cacheKey = await testCacheModes('lightweight');
        const parsedKey = JSON.parse(cacheKey);
        expect(parsedKey).not.toHaveProperty('viewHierarchyHash');
    });

    it('should generate unique cache keys when mode is disabled', async () => {
        const firstKey = await testCacheModes('disabled');
        const secondKey = await testCacheModes('disabled');
        
        expect(firstKey).not.toEqual(secondKey);
    });

    it('should not use cache when mode is disabled', async () => {

        const screenCapture: ScreenCapturerResult = {
            snapshot: SNAPSHOT_DATA,
            viewHierarchy: VIEW_HIERARCHY,
            isSnapshotImageAttached: true,
          }; 

        copilotStepPerformer = new CopilotStepPerformer(
            mockContext,
            mockPromptCreator,
            mockCodeEvaluator,
            mockSnapshotManager,
            mockPromptHandler,
            mockCacheHandler,
            mockSnapshotComparator,
            'disabled'
        );

        setupMocks({ cacheExists: true });
        await copilotStepPerformer.perform(INTENT, [], screenCapture, undefined);

        expect(mockPromptHandler.runPrompt).toHaveBeenCalled();
    });
});
});