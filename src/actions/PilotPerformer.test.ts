import { PilotPerformer } from '@/actions/PilotPerformer';
import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import { PreviousStep, PromptHandler } from '@/types';
import { StepPerformer } from '@/actions/StepPerformer';

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
  let mockStepPerformer: jest.Mocked<StepPerformer>;
  let mockGetPreviousSteps: jest.MockedFunction<() => PreviousStep[]>;

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

    mockStepPerformer = {
      captureSnapshotAndViewHierarchy: jest.fn(),
      perform: jest.fn(),
    } as unknown as jest.Mocked<StepPerformer>;

    mockGetPreviousSteps = jest.fn();

    // Instantiate PilotPerformer with the mocks
    pilotPerformer = new PilotPerformer(
      mockPromptCreator,
      mockStepPerformer,
      mockPromptHandler,
      mockGetPreviousSteps,
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
    // Mock the StepPerformer.captureSnapshotAndViewHierarchy method
    mockStepPerformer.captureSnapshotAndViewHierarchy.mockResolvedValue({
      snapshot: snapshotData !== null ? snapshotData : undefined,
      viewHierarchy: viewHierarchy,
      isSnapshotImageAttached: isSnapshotSupported && snapshotData !== null,
    });

    mockPromptCreator.createPrompt.mockReturnValue(GENERATED_PROMPT);
    mockPromptHandler.runPrompt.mockResolvedValue(promptResult);
  };

  it('should perform an intent successfully with snapshot image support', async () => {
    setupMocks();

    const result = await pilotPerformer.createStep(GOAL);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(GOAL, VIEW_HIERARCHY, true, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, SNAPSHOT_DATA);
    expect(mockStepPerformer.captureSnapshotAndViewHierarchy).toHaveBeenCalled();
  });

  it('should perform an intent successfully without snapshot image support', async () => {
    setupMocks({ isSnapshotSupported: false });

    const result = await pilotPerformer.createStep(GOAL);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(GOAL, VIEW_HIERARCHY, false, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, SNAPSHOT_DATA);
    expect(mockStepPerformer.captureSnapshotAndViewHierarchy).toHaveBeenCalled();
  });

  it('should perform an intent with undefined snapshot', async () => {
    setupMocks({ snapshotData: null });

    const result = await pilotPerformer.createStep(GOAL);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(GOAL, VIEW_HIERARCHY, false, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, undefined);
    expect(mockStepPerformer.captureSnapshotAndViewHierarchy).toHaveBeenCalled();
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

    // Mock the getPreviousSteps function to return previous intents
    mockGetPreviousSteps.mockReturnValue(previousIntents);

    const result = await pilotPerformer.createStep(intent, previousIntents);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
      intent,
      VIEW_HIERARCHY,
      true,
      previousIntents,
    );
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, SNAPSHOT_DATA);
    expect(mockStepPerformer.captureSnapshotAndViewHierarchy).toHaveBeenCalled();
  });
  
  describe('perform', () => {
    it('should stop immediately when action is success', async () => {
      const pilotOutputSuccess = {
        thoughts: 'Completed successfully',
        action: 'success',
      };

      const createStepSpy = jest
        .spyOn(pilotPerformer, 'createStep')
        .mockResolvedValue(pilotOutputSuccess);
      mockGetPreviousSteps.mockReturnValue([]);
      const result = await pilotPerformer.perform(GOAL);

      expect(createStepSpy).toHaveBeenCalledTimes(1);
      expect(createStepSpy).toHaveBeenCalledWith(GOAL, []);
      expect(mockStepPerformer.perform).not.toHaveBeenCalled();
      expect(result).toEqual({
        report: [pilotOutputSuccess],
      });
    });
  });
});