import { Copilot } from '@/Copilot';
import { CopilotStepPerformer } from '@/actions/CopilotStepPerformer';
import { CopilotError } from '@/errors/CopilotError';
import { Config, ScreenCapturerResult, PromptHandler, PilotStepReport} from '@/types';
import { mockCache, mockedCacheFile } from './test-utils/cache';
import { ScreenCapturer } from '@/utils/ScreenCapturer';
import {
  bazCategory,
  barCategory2,
  barCategory1,
  dummyContext,
} from './test-utils/APICatalogTestUtils';
import { PilotPerformer } from './actions/PilotPerformer';

jest.mock('@/actions/CopilotStepPerformer');
jest.mock('@/utils/ScreenCapturer');
jest.mock('fs');

const INTENT = 'tap button';
const SNAPSHOT_DATA = 'snapshot_data';
const VIEW_HIERARCHY = 'hash';

describe('Copilot', () => {
  let mockConfig: Config;
  let mockPromptHandler: jest.Mocked<PromptHandler>;
  let mockFrameworkDriver: any;
  let mockPilotPerformer: jest.Mocked<PilotPerformer>;
  let screenCapture: ScreenCapturerResult;

  beforeEach(() => {
    mockPromptHandler = {
      runPrompt: jest.fn(),
      isSnapshotImageSupported: jest.fn()
    } as any;

    mockFrameworkDriver = {
      apiCatalog: {
        context: {},
        categories: []
      },
      captureSnapshotImage: jest.fn(),
      captureViewHierarchyString: jest.fn()
    };

    mockPilotPerformer = {
      perform: jest.fn()
    } as any;

    mockConfig = {
      promptHandler: mockPromptHandler,
      frameworkDriver: mockFrameworkDriver
    };

    jest.spyOn(PilotPerformer.prototype, 'perform').mockImplementation(mockPilotPerformer.perform);

    screenCapture = {
      snapshot: 'base64-encoded-image',
      viewHierarchy: '<View><Button testID="login" title="Login" /></View>',
      isSnapshotImageAttached: true
    };

    jest.spyOn(console, 'error').mockImplementation(() => {});

    ScreenCapturer.prototype.capture = jest.fn().mockResolvedValue(screenCapture);
    (CopilotStepPerformer.prototype.perform as jest.Mock).mockResolvedValue({
      code: 'code',
      result: true,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    (console.error as jest.Mock).mockRestore();
    (Copilot as any)['instance'] = undefined;
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
      expect(() => Copilot.getInstance()).toThrow(
        'Copilot has not been initialized. Please call the `init()` method before using it.'
      );
    });
  });

  describe('init', () => {
    it('should create a new instance of Copilot', () => {
      Copilot.init(mockConfig);
      expect(Copilot.getInstance()).toBeInstanceOf(Copilot);
    });

    it('should throw an error when trying to initialize Copilot multiple times', () => {
      Copilot.init(mockConfig);

      expect(() => Copilot.init(mockConfig)).toThrow(
        'Copilot has already been initialized. Please call the `init()` method only once.'
      );
    });

    it('should throw an error if config is invalid', () => {
      const invalidConfig = {} as Config;

      expect(() => Copilot.init(invalidConfig)).toThrow();
    });
  });

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      expect(Copilot.isInitialized()).toBe(false);
    });

    it('should return true after initialization', () => {
      Copilot.init(mockConfig);

      expect(Copilot.isInitialized()).toBe(true);
    });
  });

  describe('performStep', () => {
    it('should call CopilotStepPerformer.perform with the given intent', async () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();
      instance.start();
      await instance.performStep(INTENT);

      expect(CopilotStepPerformer.prototype.perform).toHaveBeenCalledWith(
        INTENT,
        [],
        screenCapture,
      );
    });

    it('should return the result from CopilotStepPerformer.perform', async () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();
      instance.start();

      const result = await instance.performStep(INTENT);

      expect(result).toBe(true);
    });

    it('should accumulate previous steps', async () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();
      instance.start();
      const intent1 = 'tap button 1';
      const intent2 = 'tap button 2';

      await instance.performStep(intent1);
      await instance.performStep(intent2);

      expect(CopilotStepPerformer.prototype.perform).toHaveBeenLastCalledWith(
        intent2,
        [
          {
            step: intent1,
            code: 'code',
            result: true,
          },
        ],
        screenCapture
      );
    });
  });

  describe('start', () => {
    it('should clear previous steps', async () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();
      instance.start();
      const intent1 = 'tap button 1';
      const intent2 = 'tap button 2';

      await instance.performStep(intent1);
      instance.end(true);
      instance.start();
      await instance.performStep(intent2);

      expect(CopilotStepPerformer.prototype.perform).toHaveBeenLastCalledWith(
        intent2,
        [],
        screenCapture
      );
    });
  });

  describe('start and end behavior', () => {
    it('should not performStep before start', async () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();

      await expect(instance.performStep(INTENT)).rejects.toThrowError(
        'Copilot is not running. Please call the `start()` method before performing any steps.'
      );
    });

    it('should not start without ending the previous flow (start->start)', async () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();
      instance.start();

      await instance.performStep(INTENT);

      expect(() => instance.start()).toThrowError(
        'Copilot was already started. Please call the `end()` method before starting a new test flow.'
      );
    });

    it('should not end without starting a new flow (end->end)', () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();
      instance.start();

      instance.end(true);

      expect(() => instance.end(true)).toThrowError(
        'Copilot is not running. Please call the `start()` method before ending the test flow.'
      );
    });
  });

  describe('end', () => {
    it('end with isCacheDisabled=true should not save to cache', async () => {
      mockCache();

      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();
      instance.start();

      await instance.performStep(INTENT);
      instance.end(true);

      expect(mockedCacheFile).toBeUndefined();
    });
  });

  describe('extend API catalog', () => {
    it('should extend the API catalog with a new category', () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();

      const spyCopilotStepPerformer = jest.spyOn(
        instance['copilotStepPerformer'],
        'extendJSContext'
      );

      instance.extendAPICatalog([barCategory1]);

      expect(mockConfig.frameworkDriver.apiCatalog.categories).toEqual([
        barCategory1,
      ]);
      expect(spyCopilotStepPerformer).not.toHaveBeenCalled();
    });

    it('should extend the API catalog with a new category and context', () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();

      const spyCopilotStepPerformer = jest.spyOn(
        instance['copilotStepPerformer'],
        'extendJSContext'
      );

      instance.extendAPICatalog([barCategory1], dummyContext);

      expect(mockConfig.frameworkDriver.apiCatalog.categories).toEqual([
        barCategory1,
      ]);
      expect(spyCopilotStepPerformer).toHaveBeenCalledWith(dummyContext);
    });

    it('should extend the API catalog with an existing category', () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();

      const spyCopilotStepPerformer = jest.spyOn(
        instance['copilotStepPerformer'],
        'extendJSContext'
      );

      instance.extendAPICatalog([barCategory1]);
      instance.extendAPICatalog([barCategory2], dummyContext);

      expect(
        mockConfig.frameworkDriver.apiCatalog.categories.length
      ).toEqual(1);
      expect(
        mockConfig.frameworkDriver.apiCatalog.categories[0].items
      ).toEqual([...barCategory1.items, ...barCategory2.items]);
      expect(spyCopilotStepPerformer).toHaveBeenCalledWith(dummyContext);
    });

    it('should extend the API catalog with multiple categories sequentially', () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();

      instance.extendAPICatalog([barCategory1]);
      instance.extendAPICatalog([bazCategory]);

      expect(mockConfig.frameworkDriver.apiCatalog.categories).toEqual([barCategory1, bazCategory]);
    });

    it('should pilot through steps successfully', async () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();
      const goal = 'test goal';

      const mockPilotResult = {
        goal,
        steps: [
          {
            plan: {
              thoughts: "Step 1 thoughts",
              action: "Tap on GREAT button"
            },
            code: "code executed"
          },
          {
            plan: {
              thoughts: "Completed successfully",
              action: "success"
            }
          }
        ]
      };

      mockPilotPerformer.perform.mockResolvedValue(mockPilotResult);

      const pilotResult = await instance.pilot(goal);

      expect(instance['pilotPerformer'].perform).toHaveBeenCalledWith(goal);
      expect(pilotResult).toEqual(mockPilotResult);
    });
  });

  describe('pilot', () => {
    it('should perform an entire test flow using the provided goal', async () => {
      Copilot.init(mockConfig);
      const instance = Copilot.getInstance();
      const goal = 'Test the login flow';

      const pilotOutputStep1: PilotStepReport = {
        plan: {
          thoughts: 'Step 1 thoughts',
          action: 'Tap on GREAT button',
        },
        review: {
          ux: {
            summary: 'UX review for step 1',
            findings: [],
            score: '7/10',
          },
          a11y: {
            summary: 'Accessibility review for step 1',
            findings: [],
            score: '8/10',
          },
        },
      };

      const pilotOutputSuccess: PilotStepReport = {
        plan: {
          thoughts: 'Completed successfully <SUMMARY> all was good </SUMMARY>',
          action: 'success',
        },
        review: {
          ux: {
            summary: 'Final UX review',
            findings: [],
            score: '9/10',
          },
          a11y: {
            summary: 'Final Accessibility review',
            findings: [],
            score: '9/10',
          },
        },
      };

      jest.spyOn(instance['pilotPerformer'], 'perform').mockResolvedValue({
        summary: 'all was good',
        goal: goal,
        steps: [
          {
            plan: pilotOutputStep1.plan,
            code: 'code executed',
            review: pilotOutputStep1.review,
          },
        ],
        review: pilotOutputSuccess.review,
      });

      const result = await instance.pilot(goal);

      expect(instance['pilotPerformer'].perform).toHaveBeenCalledWith(goal);
      expect(result).toEqual({
        summary: 'all was good',
        goal: goal,
        steps: [
          {
            plan: pilotOutputStep1.plan,
            code: 'code executed',
            review: pilotOutputStep1.review,
          },
        ],
        review: pilotOutputSuccess.review,
      });
    });
  });
});
