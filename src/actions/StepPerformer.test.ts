import {StepPerformer} from '@/actions/StepPerformer';
import {PromptCreator} from '@/utils/PromptCreator';
import {CodeEvaluator} from '@/utils/CodeEvaluator';
import {SnapshotManager} from '@/utils/SnapshotManager';
import {CacheHandler} from '@/utils/CacheHandler';
import {PromptHandler, TestingFrameworkAPICatalog} from '@/types';
import * as fs from 'fs';
import * as crypto from 'crypto';
import mock = jest.mock;

jest.mock('fs');
jest.mock('crypto');

const INTENT = 'tap button';
const VIEW_HIERARCHY = '<view></view>';
const PROMPT_RESULT = 'generated code';
const CODE_EVALUATION_RESULT = 'success';
const SNAPSHOT_DATA = 'snapshot_data';
const VIEW_HIERARCHY_HASH = 'hash';
const CACHE_KEY = JSON.stringify({ step: INTENT, previous: [], viewHierarchyHash: VIEW_HIERARCHY_HASH });

describe('StepPerformer', () => {
    let stepPerformer: StepPerformer;
    let mockContext: jest.Mocked<any>;
    let mockPromptCreator: jest.Mocked<PromptCreator>;
    let mockCodeEvaluator: jest.Mocked<CodeEvaluator>;
    let mockSnapshotManager: jest.Mocked<SnapshotManager>;
    let mockPromptHandler: jest.Mocked<PromptHandler>;
    let mockCacheHandler: jest.Mocked<CacheHandler>;

    beforeEach(() => {
        jest.resetAllMocks();

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

        stepPerformer = new StepPerformer(
            mockContext,
            mockPromptCreator,
            mockCodeEvaluator,
            mockSnapshotManager,
            mockPromptHandler,
            mockCacheHandler
        );
    });

    interface SetupMockOptions {
        isSnapshotSupported?: boolean;
        snapshotData?: string | null;
        viewHierarchy?: string;
        promptResult?: string;
        codeEvaluationResult?: any;
        cacheExists?: boolean;
    }

    const setupMocks = ({
                            isSnapshotSupported = true,
                            snapshotData = SNAPSHOT_DATA,
                            viewHierarchy = VIEW_HIERARCHY,
                            promptResult = PROMPT_RESULT,
                            codeEvaluationResult = CODE_EVALUATION_RESULT,
                            cacheExists = false,
                        }: SetupMockOptions = {}) => {
        mockPromptHandler.isSnapshotImageSupported.mockReturnValue(isSnapshotSupported);
        mockSnapshotManager.captureSnapshotImage.mockResolvedValue(
            snapshotData != null ? snapshotData : undefined,
        );
        mockSnapshotManager.captureViewHierarchyString.mockResolvedValue(viewHierarchy);
        mockPromptCreator.createPrompt.mockReturnValue('generated prompt');
        mockPromptHandler.runPrompt.mockResolvedValue(promptResult);
        mockCodeEvaluator.evaluate.mockResolvedValue(codeEvaluationResult);

        const viewHierarchyHash = 'hash';
        (crypto.createHash as jest.Mock).mockReturnValue({
            update: jest.fn().mockReturnValue({
                digest: jest.fn().mockReturnValue(viewHierarchyHash),
            }),
        });

        if (cacheExists) {
            const cacheData: Map<string, any> = new Map();
            cacheData.set(CACHE_KEY, PROMPT_RESULT);

            mockCacheHandler.getStepFromCache.mockImplementation((key: string) => {
                return cacheData.get(key);
            });
        }
    };

    it('should perform an intent successfully with snapshot image support', async () => {
        setupMocks();

        const result = await stepPerformer.perform(INTENT);

        expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
        expect(result).toBe('success');
        expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
            INTENT,
            VIEW_HIERARCHY,
            true,
            [],
        );
        expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', SNAPSHOT_DATA);
        expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, mockContext);
        expect(mockCacheHandler.getStepFromCache).toHaveBeenCalledWith(CACHE_KEY);
        expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalledWith(CACHE_KEY,PROMPT_RESULT);
    });

    it('should perform an intent successfully without snapshot image support', async () => {
        setupMocks({isSnapshotSupported: false});

        const result = await stepPerformer.perform(INTENT);

        expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
        expect(result).toBe('success');
        expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
            INTENT,
            VIEW_HIERARCHY,
            false,
            [],
        );
        expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', undefined);
        expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, mockContext);
        expect(mockCacheHandler.getStepFromCache).toHaveBeenCalledWith(CACHE_KEY);
        expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalledWith(CACHE_KEY,PROMPT_RESULT);
    });

    it('should perform an intent with undefined snapshot', async () => {
        setupMocks({snapshotData: null});

        const result = await stepPerformer.perform(INTENT);

        expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
        expect(result).toBe('success');
        expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
            INTENT,
            VIEW_HIERARCHY,
            false,
            [],
        );
        expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', undefined);
        expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, mockContext);
        expect(mockCacheHandler.getStepFromCache).toHaveBeenCalledWith(CACHE_KEY);
        expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalledWith(CACHE_KEY,PROMPT_RESULT);
    });

    it('should perform an intent successfully with previous intents', async () => {
        const intent = 'current intent';
        const previousIntents = [{
            step: 'previous intent',
            code: 'previous code',
            result: 'previous result',
        }];

        setupMocks();

        const thisCacheKey = JSON.stringify({ step: intent, previous: previousIntents, viewHierarchyHash: VIEW_HIERARCHY_HASH });
        const result = await stepPerformer.perform(intent, previousIntents);

        expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
        expect(result).toBe('success');
        expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
            intent,
            VIEW_HIERARCHY,
            true,
            previousIntents,
        );
        expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith('generated prompt', SNAPSHOT_DATA);
        expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith(PROMPT_RESULT, mockContext);
        expect(mockCacheHandler.getStepFromCache).toHaveBeenCalledWith(thisCacheKey);
        expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalledWith(thisCacheKey,PROMPT_RESULT);
    });

    it('should throw an error if code evaluation fails', async () => {
        setupMocks();
        mockCodeEvaluator.evaluate.mockRejectedValue(new Error('Evaluation failed'));

        await expect(stepPerformer.perform(INTENT)).rejects.toThrow('Evaluation failed');
        expect(mockCacheHandler.addToTemporaryCache).toHaveBeenCalledWith(CACHE_KEY,PROMPT_RESULT);
    });

    it('should use cached prompt result if available', async () => {
        setupMocks({cacheExists: true});

        const result = await stepPerformer.perform(INTENT);

        expect(result).toBe('success');
        expect(mockCacheHandler.getStepFromCache).toHaveBeenCalledWith(CACHE_KEY);
        // Should not call runPrompt or createPrompt since result is cached
        expect(mockPromptCreator.createPrompt).not.toHaveBeenCalled();
        expect(mockPromptHandler.runPrompt).not.toHaveBeenCalled();
        expect(mockCodeEvaluator.evaluate).toHaveBeenCalledWith('generated code', mockContext);
        expect(mockCacheHandler.addToTemporaryCache).not.toHaveBeenCalled(); // No need to save cache again
    });

    it('should retry if initial runPrompt throws an error and succeed on retry', async () => {
        setupMocks();
        const error = new Error('Initial prompt failed');
        mockPromptHandler.runPrompt.mockRejectedValueOnce(error);
        // On retry, it succeeds
        mockPromptHandler.runPrompt.mockResolvedValueOnce('retry generated code');

        const result = await stepPerformer.perform(INTENT);

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

        await expect(stepPerformer.perform(INTENT)).rejects.toThrow(retryError);
        expect(mockCacheHandler.loadCacheFromFile).toHaveBeenCalled();
        expect(mockPromptCreator.createPrompt).toHaveBeenCalledTimes(2);
        expect(mockPromptHandler.runPrompt).toHaveBeenCalledTimes(2);
        expect(mockCodeEvaluator.evaluate).not.toHaveBeenCalled();
        expect(mockCacheHandler.addToTemporaryCache).not.toHaveBeenCalled();
    });
});
