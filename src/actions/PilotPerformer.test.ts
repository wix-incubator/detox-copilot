import { PilotPerformer } from '@/actions/PilotPerformer';
import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import { PreviousStep, PromptHandler, CaptureResult } from '@/types';
import { CopilotStepPerformer } from '@/actions/CopilotStepPerformer';

const GOAL = 'tap button';
const VIEW_HIERARCHY = '<view></view>';
const PROMPT_RESULT = `
These are my thoughts:
<THOUGHTS>
I think this is great
</THOUGHTS>
This is the action the copilot should perform:
<ACTION>
Tap on GREAT button
</ACTION>
<ACTION>
Tap on WOW button
</ACTION>`;
const SNAPSHOT_DATA = 'snapshot_data';
const GENERATED_PROMPT = 'generated prompt';

describe('PilotPerformer', () => {
  let pilotPerformer: PilotPerformer;
  let mockPromptCreator: jest.Mocked<PilotPromptCreator>;
  let mockPromptHandler: jest.Mocked<PromptHandler>;
  let mockCopilotStepPerformer: jest.Mocked<CopilotStepPerformer>;
  let mockCapture: jest.MockedFunction<() => Promise<CaptureResult>>;
  let mockCaptureResult: CaptureResult;

  beforeEach(() => {
    jest.resetAllMocks();

    // Create mock instances of dependencies
    mockPromptCreator = {
      createPrompt: jest.fn(),
      createBasePrompt: jest.fn(),
      createContext: jest.fn(),
      createAPIInfo: jest.fn(),
    } as unknown as jest.Mocked<PilotPromptCreator>;

    mockPromptHandler = {
      runPrompt: jest.fn(),
      isSnapshotImageSupported: jest.fn(),
    } as jest.Mocked<PromptHandler>;

    mockCopilotStepPerformer = {
      perform: jest.fn(),
    } as unknown as jest.Mocked<CopilotStepPerformer>;

    // Create mock for capture function
    mockCapture = jest.fn();

    // Instantiate PilotPerformer with the mocks, including the capture function
    pilotPerformer = new PilotPerformer(
      mockPromptCreator,
      mockCopilotStepPerformer,
      mockPromptHandler,
      mockCapture // Pass the mock capture function
    );
  });

  interface SetupMockOptions {
    isSnapshotSupported?: boolean;
    snapshotData?: string | null;
    viewHierarchy?: string;
    promptResult?: string;
  }

  const setupMocks = ({
    isSnapshotSupported = true,
    snapshotData = SNAPSHOT_DATA,
    viewHierarchy = VIEW_HIERARCHY,
    promptResult = PROMPT_RESULT,
  }: SetupMockOptions = {}) => {
    // Prepare the mockCaptureResult object
    mockCaptureResult = {
      snapshot: snapshotData !== null ? snapshotData : undefined,
      viewHierarchy: viewHierarchy,
      isSnapshotImageAttached: isSnapshotSupported && snapshotData !== null,
    };

    // Mock the capture function to return mockCaptureResult
    mockCapture.mockResolvedValue(mockCaptureResult);

    mockPromptCreator.createPrompt.mockReturnValue(GENERATED_PROMPT);
    mockPromptHandler.runPrompt.mockResolvedValue(promptResult);
  };

  it('should perform an intent successfully with snapshot image support', async () => {
    setupMocks();

    const result = await pilotPerformer.createStepPlan(GOAL, [], mockCaptureResult);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(GOAL, VIEW_HIERARCHY, true, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, SNAPSHOT_DATA);
    // No need to check mockCapture in createStepPlan, since we passed in the captureResult directly
  });

  it('should perform an intent successfully without snapshot image support', async () => {
    setupMocks({ isSnapshotSupported: false });

    const result = await pilotPerformer.createStepPlan(GOAL, [], mockCaptureResult);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(GOAL, VIEW_HIERARCHY, false, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, SNAPSHOT_DATA);
  });

  it('should perform an intent with undefined snapshot', async () => {
    setupMocks({ snapshotData: null });

    const result = await pilotPerformer.createStepPlan(GOAL, [], mockCaptureResult);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(GOAL, VIEW_HIERARCHY, false, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, undefined);
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

    setupMocks();

    const result = await pilotPerformer.createStepPlan(intent, previousIntents, mockCaptureResult);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
      intent,
      VIEW_HIERARCHY,
      true,
      previousIntents,
    );
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, SNAPSHOT_DATA);
  });

  describe('perform', () => {
    it('should perform multiple steps until success is returned', async () => {
      const pilotOutputStep1 = {
        thoughts: 'Step 1 thoughts',
        action: 'Tap on GREAT button',
      };

      const pilotOutputSuccess = {
        thoughts: 'Completed successfully',
        action: 'success',
      };

      const captureResult = {
        snapshot: SNAPSHOT_DATA,
        viewHierarchy: VIEW_HIERARCHY,
        isSnapshotImageAttached: true,
      };

      // Mock capture to return captureResult on each call
      mockCapture.mockResolvedValue(captureResult);

      // Mock createStepPlan to return pilotOutputStep1, then pilotOutputSuccess
      const createStepPlanSpy = jest.spyOn(pilotPerformer, 'createStepPlan')
        .mockResolvedValueOnce(pilotOutputStep1)
        .mockResolvedValueOnce(pilotOutputSuccess);

      const performSpy = mockCopilotStepPerformer.perform.mockResolvedValue({
        code: 'code executed',
        result: 'result of execution',
      });

      const result = await pilotPerformer.perform(GOAL);

      expect(mockCapture).toHaveBeenCalledTimes(2);
      expect(createStepPlanSpy).toHaveBeenCalledTimes(2);

      // Access the arguments passed to perform at the time of the call
      const performCallArgs = performSpy.mock.calls[0];

      // Assert on the arguments
      expect(performCallArgs[0]).toBe('Tap on GREAT button');
      expect(performCallArgs[1]).toEqual([]); // previousSteps should be empty at the time of the call
      expect(performCallArgs[2]).toBeUndefined();
      expect(performCallArgs[3]).toBe(captureResult);

      expect(result).toEqual({
        steps: [
          { plan: pilotOutputStep1, code: 'code executed' },
          { plan: pilotOutputSuccess },
        ],
      });
    });
  });
});