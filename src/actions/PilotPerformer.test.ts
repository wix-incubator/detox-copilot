import { PilotPerformer } from "@/actions/PilotPerformer";
import { PilotPromptCreator } from "@/utils/PilotPromptCreator";
import { ScreenCapturer } from "@/utils/ScreenCapturer";
import {
  PreviousStep,
  PromptHandler,
  ScreenCapturerResult,
  PilotStepReport,
  PilotReport,
} from "@/types";
import { CopilotStepPerformer } from "@/actions/CopilotStepPerformer";

const GOAL = "tap button";
const VIEW_HIERARCHY = "<view></view>";
const GENERATED_PROMPT = "generated prompt";

// Updated PROMPT_RESULT to include UX and Accessibility sections
const PROMPT_RESULT = `
<THOUGHTS>
I think this is great
</THOUGHTS>
<ACTION>
Tap on GREAT button
</ACTION>
<UX>
<SUMMARY>
The review of UX
</SUMMARY>
<FINDINGS>
- UX finding one
- UX finding two
</FINDINGS>
<SCORE>
7/10
</SCORE>
</UX>
<ACCESSIBILITY>
<SUMMARY>
The review of accessibility
</SUMMARY>
<FINDINGS>
- ACC finding one
- ACC finding two
</FINDINGS>
<SCORE>
8/10
</SCORE>
</ACCESSIBILITY>`;

const SNAPSHOT_DATA = "snapshot_data";

describe("PilotPerformer", () => {
  let pilotPerformer: PilotPerformer;
  let mockPromptCreator: jest.Mocked<PilotPromptCreator>;
  let mockPromptHandler: jest.Mocked<PromptHandler>;
  let mockCopilotStepPerformer: jest.Mocked<CopilotStepPerformer>;
  let mockScreenCapturer: jest.Mocked<ScreenCapturer>;
  let mockCaptureResult: ScreenCapturerResult;

  beforeEach(() => {
    jest.resetAllMocks();

    // Create mock instances of dependencies
    mockPromptCreator = {
      createPrompt: jest.fn(),
    } as unknown as jest.Mocked<PilotPromptCreator>;

    mockPromptHandler = {
      runPrompt: jest.fn(),
      isSnapshotImageSupported: jest.fn(),
    } as jest.Mocked<PromptHandler>;

    mockCopilotStepPerformer = {
      perform: jest.fn(),
    } as unknown as jest.Mocked<CopilotStepPerformer>;

    // Create mock for capture function
    mockScreenCapturer = {
      capture: jest.fn(),
    } as unknown as jest.Mocked<ScreenCapturer>;

    // Instantiate PilotPerformer with the mocks, including the capture function
    pilotPerformer = new PilotPerformer(
      mockPromptCreator,
      mockCopilotStepPerformer,
      mockPromptHandler,
      mockScreenCapturer, // Pass the mock capture function
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
    mockScreenCapturer.capture.mockResolvedValue(mockCaptureResult);

    mockPromptCreator.createPrompt.mockReturnValue(GENERATED_PROMPT);
    mockPromptHandler.runPrompt.mockResolvedValue(promptResult);
  };

  it("should perform an intent successfully with snapshot image support", async () => {
    setupMocks();

    const result = await pilotPerformer.analyseScreenAndCreateCopilotStep(
      GOAL,
      [],
      mockCaptureResult,
    );

    const expectedResult = {
      plan: {
        thoughts: "I think this is great",
        action: "Tap on GREAT button",
      },
      review: {
        ux: {
          summary: "The review of UX",
          findings: ["- UX finding one", "- UX finding two"],
          score: "7/10",
        },
        a11y: {
          summary: "The review of accessibility",
          findings: ["- ACC finding one", "- ACC finding two"],
          score: "8/10",
        },
      },
    };

    expect(result).toEqual(expectedResult);
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
      GOAL,
      VIEW_HIERARCHY,
      true,
      [],
    );
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(
      GENERATED_PROMPT,
      SNAPSHOT_DATA,
    );
  });

  it("should perform an intent successfully without snapshot image support", async () => {
    setupMocks({ isSnapshotSupported: false });

    const result = await pilotPerformer.analyseScreenAndCreateCopilotStep(
      GOAL,
      [],
      mockCaptureResult,
    );

    const expectedResult = {
      plan: {
        thoughts: "I think this is great",
        action: "Tap on GREAT button",
      },
      review: {
        ux: {
          summary: "The review of UX",
          findings: ["- UX finding one", "- UX finding two"],
          score: "7/10",
        },
        a11y: {
          summary: "The review of accessibility",
          findings: ["- ACC finding one", "- ACC finding two"],
          score: "8/10",
        },
      },
    };

    expect(result).toEqual(expectedResult);
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
      GOAL,
      VIEW_HIERARCHY,
      false,
      [],
    );
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(
      GENERATED_PROMPT,
      SNAPSHOT_DATA,
    );
  });

  it("should perform an intent with undefined snapshot", async () => {
    setupMocks({ snapshotData: null });

    const result = await pilotPerformer.analyseScreenAndCreateCopilotStep(
      GOAL,
      [],
      mockCaptureResult,
    );

    const expectedResult = {
      plan: {
        thoughts: "I think this is great",
        action: "Tap on GREAT button",
      },
      review: {
        ux: {
          summary: "The review of UX",
          findings: ["- UX finding one", "- UX finding two"],
          score: "7/10",
        },
        a11y: {
          summary: "The review of accessibility",
          findings: ["- ACC finding one", "- ACC finding two"],
          score: "8/10",
        },
      },
    };

    expect(result).toEqual(expectedResult);
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
      GOAL,
      VIEW_HIERARCHY,
      false,
      [],
    );
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(
      GENERATED_PROMPT,
      undefined,
    );
  });

  it("should perform an intent successfully with previous intents", async () => {
    const intent = "current intent";
    const previousIntents: PreviousStep[] = [
      {
        step: "previous intent",
        code: "previous code",
        result: "previous result",
      },
    ];

    setupMocks();

    const result = await pilotPerformer.analyseScreenAndCreateCopilotStep(
      intent,
      previousIntents,
      mockCaptureResult,
    );

    const expectedResult = {
      plan: {
        thoughts: "I think this is great",
        action: "Tap on GREAT button",
      },
      review: {
        ux: {
          summary: "The review of UX",
          findings: ["- UX finding one", "- UX finding two"],
          score: "7/10",
        },
        a11y: {
          summary: "The review of accessibility",
          findings: ["- ACC finding one", "- ACC finding two"],
          score: "8/10",
        },
      },
    };

    expect(result).toEqual(expectedResult);
    expect(mockPromptCreator.createPrompt).toHaveBeenCalledWith(
      intent,
      VIEW_HIERARCHY,
      true,
      previousIntents,
    );
    expect(mockPromptHandler.runPrompt).toHaveBeenCalledWith(
      GENERATED_PROMPT,
      SNAPSHOT_DATA,
    );
  });

  describe("perform", () => {
    it("should perform multiple steps until success is returned", async () => {
      const pilotOutputStep1: PilotStepReport = {
        plan: {
          thoughts: "Step 1 thoughts",
          action: "Tap on GREAT button",
        },
        review: {
          ux: {
            summary: "UX review for step 1",
            findings: [],
            score: "7/10",
          },
          a11y: {
            summary: "Accessibility review for step 1",
            findings: [],
            score: "8/10",
          },
        },
      };

      const pilotOutputSuccess: PilotStepReport = {
        plan: {
          thoughts: "Completed successfully <SUMMARY> all was good </SUMMARY>",
          action: "success",
        },
        review: {
          ux: {
            summary: "Final UX review",
            findings: [],
            score: "9/10",
          },
          a11y: {
            summary: "Final Accessibility review",
            findings: [],
            score: "9/10",
          },
        },
      };

      const screenCapturerResult: ScreenCapturerResult = {
        snapshot: SNAPSHOT_DATA,
        viewHierarchy: VIEW_HIERARCHY,
        isSnapshotImageAttached: true,
      };

      // Mock capture to return ScreenCapturerResult on each call
      mockScreenCapturer.capture.mockResolvedValue(screenCapturerResult);

      // Mock analyseScreenAndCreateCopilotStep to return pilotOutputStep1, then pilotOutputSuccess
      const analyseScreenAndCreateCopilotStep = jest
        .spyOn(pilotPerformer, "analyseScreenAndCreateCopilotStep")
        .mockResolvedValueOnce(pilotOutputStep1)
        .mockResolvedValueOnce(pilotOutputSuccess);

      jest.spyOn(mockCopilotStepPerformer, "perform").mockResolvedValue({
        code: "code executed",
        result: "result of execution",
      });

      const result = await pilotPerformer.perform(GOAL);

      expect(mockScreenCapturer.capture).toHaveBeenCalledTimes(2);
      expect(analyseScreenAndCreateCopilotStep).toHaveBeenCalledTimes(2);

      const expectedReport: PilotReport = {
        summary: "all was good",
        goal: GOAL,
        steps: [
          {
            plan: pilotOutputStep1.plan,
            code: "code executed",
            review: pilotOutputStep1.review,
          },
        ],
        review: pilotOutputSuccess.review,
      };

      expect(result).toEqual(expectedReport);
    });
  });
});
