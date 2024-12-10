import { Copilot } from '@/Copilot';
import { StepPerformer } from '@/actions/StepPerformer';
import { CopilotError } from '@/errors/CopilotError';
import { Config } from "@/types";
import fs from "fs";
import { mockCache, mockedCacheFile } from "./test-utils/cache";

jest.mock('@/actions/StepPerformer');
jest.mock('fs');

const INTENT = 'tap button';

describe('Copilot', () => {
    let mockConfig: Config;

    beforeEach(() => {
        mockConfig = {
            frameworkDriver: {
                captureSnapshotImage: jest.fn(),
                captureViewHierarchyString: jest.fn(),
                apiCatalog: {
                    context: {},
                    categories: []
                },
            },
            promptHandler: {
                runPrompt: jest.fn(),
                isSnapshotImageSupported: jest.fn().mockReturnValue(true)
            }
        };
        jest.spyOn(console, 'error').mockImplementation(() => {});

        (StepPerformer.prototype.perform as jest.Mock).mockResolvedValue({code: 'code', result: true});
    });

    afterEach(() => {
        jest.resetAllMocks();
        (console.error as jest.Mock).mockRestore();
        Copilot['instance'] = undefined;
    });

    describe('getInstance', () => {
        it('should return the same instance after initialization', () => {
            Copilot.init(mockConfig);

            const instance1 = Copilot.getInstance();
            const instance2 = Copilot.getInstance();

            expect(instance1).toBe(instance2);
        });

        it('should throw CopilotError if getInstance is called before init', () => {
            expect(() => Copilot.getInstance()).toThrow(CopilotError);
            expect(() => Copilot.getInstance()).toThrow('Copilot has not been initialized. Please call the `init()` method before using it.');
        });
    });

    describe('init', () => {
        it('should create a new instance of Copilot', () => {
            Copilot.init(mockConfig);
            expect(Copilot.getInstance()).toBeInstanceOf(Copilot);
        });

        it('should overwrite existing instance when called multiple times', () => {
            Copilot.init(mockConfig);
            const instance1 = Copilot.getInstance();

            Copilot.init(mockConfig);
            const instance2 = Copilot.getInstance();

            expect(instance1).not.toBe(instance2);
        });

        it('should throw an error if config is invalid', () => {
            const invalidConfig = {} as Config;

            expect(() => Copilot.init(invalidConfig)).toThrow();
        });
    });

    describe('perform', () => {
        it('should call StepPerformer.perform with the given intent', async () => {

            Copilot.init(mockConfig);
            const instance = Copilot.getInstance();
            instance.start();

            await instance.performStep(INTENT);

            expect(StepPerformer.prototype.perform).toHaveBeenCalledWith(INTENT, []);
        });

        it('should return the result from StepPerformer.perform', async () => {
            Copilot.init(mockConfig);
            const instance = Copilot.getInstance();
            instance.start();

            const result = await instance.performStep(INTENT);

            expect(result).toBe(true);
        });

        it('should accumulate previous intents', async () => {
            Copilot.init(mockConfig);
            const instance = Copilot.getInstance();
            instance.start();
            const intent1 = 'tap button 1';
            const intent2 = 'tap button 2';

            await instance.performStep(intent1);
            await instance.performStep(intent2);

            expect(StepPerformer.prototype.perform).toHaveBeenLastCalledWith(intent2, [{
                step: intent1,
                code: 'code',
                result: true
            }]);
        });
    });

    describe('start', () => {
        it('should clear previous intents', async () => {
            Copilot.init(mockConfig);
            const instance = Copilot.getInstance();
            instance.start();
            const intent1 = 'tap button 1';
            const intent2 = 'tap button 2';

            await instance.performStep(intent1);
            instance.end(true);
            instance.start();
            await instance.performStep(intent2);

            expect(StepPerformer.prototype.perform).toHaveBeenLastCalledWith(intent2, []);
        });
    });

    describe('start and end behavior', () => {
        it('should not perform before start', async () => {
            Copilot.init(mockConfig);
            const instance = Copilot.getInstance();

            await expect(instance.performStep(INTENT)).rejects.toThrowError('Copilot is not running. Please call the `start()` method before performing any steps.');
        });

        it('should not start without end the previous flow(start->start)', async () => {
            Copilot.init(mockConfig);
            const instance = Copilot.getInstance();
            instance.start();

            await instance.performStep(INTENT);

            expect(() => instance.start()).toThrowError('Copilot was already started. Please call the `end()` method before starting a new test flow.');
        });

        it('should not end without start a new flow(end->end)', async () => {
            Copilot.init(mockConfig);
            const instance = Copilot.getInstance();
            instance.start();

            await instance.performStep(INTENT);
            instance.end(true);

            expect(() => instance.end(true)).toThrowError('Copilot is not running. Please call the `start()` method before ending the test flow.');
        });
    });

    describe('end', () => {
        it('end with disable cache=true should not save to cache', async () => {
            mockCache();

            Copilot.init(mockConfig);
            const instance = Copilot.getInstance();
            instance.start();

            await instance.performStep(INTENT);
            instance.end(true);

            expect(mockedCacheFile).toBeUndefined();
        });
    });
});
