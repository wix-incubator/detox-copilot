import { PilotPerformer } from '@/actions/PilotPerformer';
import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import { PreviousStep, PromptHandler } from '@/types';
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

    mockCopilotStepPerformer = {
      captureSnapshotAndViewHierarchy: jest.fn(),
      perform: jest.fn(),
    } as unknown as jest.Mocked<CopilotStepPerformer>;


    // Instantiate PilotPerformer with the mocks
    pilotPerformer = new PilotPerformer(
      mockPromptCreator,
      mockCopilotStepPerformer,
      mockPromptHandler,
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
    mockCopilotStepPerformer.captureSnapshotAndViewHierarchy.mockResolvedValue({
      snapshot: snapshotData !== null ? snapshotData : undefined,
      viewHierarchy: viewHierarchy,
      isSnapshotImageAttached: isSnapshotSupported && snapshotData !== null,
    });

    mockPromptCreator.createPrompt.mockReturnValue(GENERATED_PROMPT);
    mockPromptHandler.runPrompt.mockResolvedValue(promptResult);
  };

  it('should perform an intent successfully with snapshot image support', async () => {
    setupMocks();

    const result = await pilotPerformer.createStepPlan(GOAL);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(GOAL, VIEW_HIERARCHY, true, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, SNAPSHOT_DATA);
    expect(mockCopilotStepPerformer.captureSnapshotAndViewHierarchy).toHaveBeenCalled();
  });

  it('should perform an intent successfully without snapshot image support', async () => {
    setupMocks({ isSnapshotSupported: false });

    const result = await pilotPerformer.createStepPlan(GOAL);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(GOAL, VIEW_HIERARCHY, false, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, SNAPSHOT_DATA);
    expect(mockCopilotStepPerformer.captureSnapshotAndViewHierarchy).toHaveBeenCalled();
  });

  it('should perform an intent with undefined snapshot', async () => {
    setupMocks({ snapshotData: null });

    const result = await pilotPerformer.createStepPlan(GOAL);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(GOAL, VIEW_HIERARCHY, false, []);
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, undefined);
    expect(mockCopilotStepPerformer.captureSnapshotAndViewHierarchy).toHaveBeenCalled();
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

    const result = await pilotPerformer.createStepPlan(intent, previousIntents);

    expect(result).toEqual({ thoughts: 'I think this is great', action: 'Tap on GREAT button' });
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
      intent,
      VIEW_HIERARCHY,
      true,
      previousIntents,
    );
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(GENERATED_PROMPT, SNAPSHOT_DATA);
    expect(mockCopilotStepPerformer.captureSnapshotAndViewHierarchy).toHaveBeenCalled();
  });
  
  describe('perform', () => {
    it('should stop immediately when action is success', async () => {
      const pilotOutputSuccess = {
        thoughts: 'Completed successfully',
        action: 'success',
      };

      const createStepPlanSpy = jest
        .spyOn(pilotPerformer, 'createStepPlan')
        .mockResolvedValue(pilotOutputSuccess);
      const result = await pilotPerformer.perform(GOAL);

      expect(createStepPlanSpy).toHaveBeenCalledTimes(1);
      expect(createStepPlanSpy).toHaveBeenCalledWith(GOAL, []);
      expect(mockCopilotStepPerformer.perform).not.toHaveBeenCalled();
      expect(result).toEqual({
        report: [{"plan" :pilotOutputSuccess}],
      });
    });
  });
});