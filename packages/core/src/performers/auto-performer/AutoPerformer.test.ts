import { AutoPerformer } from "@/performers/auto-performer/AutoPerformer";
import { AutoPerformerPromptCreator } from "@/performers/auto-performer/AutoPerformerPromptCreator";
import { ScreenCapturer } from "@/common/snapshot/ScreenCapturer";
import {
  AutoPreviousStep,
  PromptHandler,
  ScreenCapturerResult,
  AutoStepReport,
  AutoReport,
} from "@/types";
import { StepPerformer } from "@/performers/step-performer/StepPerformer";

const GOAL = "tap button";
const VIEW_HIERARCHY = "<view></view>";
const GENERATED_PROMPT = "generated prompt";

// Updated PROMPT_RESULT to include screenDescription, UX, Accessibility, and Internationalization sections
const PROMPT_RESULT = `
<SCREENDESCRIPTION>
default name
</SCREENDESCRIPTION>
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
</ACCESSIBILITY>
<INTERNATIONALIZATION>
<SUMMARY>
The review of i18n
</SUMMARY>
<FINDINGS>
- i18n finding one
- i18n finding two
</FINDINGS>
<SCORE>
6/10
</SCORE>
</INTERNATIONALIZATION>`;

const SNAPSHOT_DATA = "snapshot_data";

describe("PilotPerformer", () => {
  let pilotPerformer: AutoPerformer;
  let mockPromptCreator: jest.Mocked<AutoPerformerPromptCreator>;
  let mockPromptHandler: jest.Mocked<PromptHandler>;
  let mockStepPerformer: jest.Mocked<StepPerformer>;
  let mockScreenCapturer: jest.Mocked<ScreenCapturer>;
  let mockCaptureResult: ScreenCapturerResult;

  beforeEach(() => {
    jest.resetAllMocks();

    // Create mock instances of dependencies
    mockPromptCreator = {
      createPrompt: jest.fn(),
    } as unknown as jest.Mocked<AutoPerformerPromptCreator>;

    mockPromptHandler = {
      runPrompt: jest.fn(),
      isSnapshotImageSupported: jest.fn(),
    } as jest.Mocked<PromptHandler>;

    mockStepPerformer = {
      perform: jest.fn(),
    } as unknown as jest.Mocked<StepPerformer>;

    // Create mock for capture function
    mockScreenCapturer = {
      capture: jest.fn(),
    } as unknown as jest.Mocked<ScreenCapturer>;

    // Instantiate PilotPerformer with the mocks
    pilotPerformer = new AutoPerformer(
      mockPromptCreator,
      mockStepPerformer,
      mockPromptHandler,
      mockScreenCapturer,
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

    const result = await pilotPerformer.analyseScreenAndCreatePilotStep(
      GOAL,
      [],
      mockCaptureResult,
    );

    const expectedResult = {
      screenDescription: "default name",
      plan: {
        thoughts: "I think this is great",
        action: "Tap on GREAT button",
      },
      review: {
        ux: {
          summary: "The review of UX",
          findings: ["UX finding one", "UX finding two"],
          score: "7/10",
        },
        a11y: {
          summary: "The review of accessibility",
          findings: ["ACC finding one", "ACC finding two"],
          score: "8/10",
        },
        i18n: {
          summary: "The review of i18n",
          findings: ["i18n finding one", "i18n finding two"],
          score: "6/10",
        },
      },
      goalAchieved: false,
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

    const result = await pilotPerformer.analyseScreenAndCreatePilotStep(
      GOAL,
      [],
      mockCaptureResult,
    );

    const expectedResult = {
      screenDescription: "default name",
      plan: {
        thoughts: "I think this is great",
        action: "Tap on GREAT button",
      },
      review: {
        ux: {
          summary: "The review of UX",
          findings: ["UX finding one", "UX finding two"],
          score: "7/10",
        },
        a11y: {
          summary: "The review of accessibility",
          findings: ["ACC finding one", "ACC finding two"],
          score: "8/10",
        },
        i18n: {
          summary: "The review of i18n",
          findings: ["i18n finding one", "i18n finding two"],
          score: "6/10",
        },
      },
      goalAchieved: false,
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

    const result = await pilotPerformer.analyseScreenAndCreatePilotStep(
      GOAL,
      [],
      mockCaptureResult,
    );

    const expectedResult = {
      screenDescription: "default name",
      plan: {
        thoughts: "I think this is great",
        action: "Tap on GREAT button",
      },
      review: {
        ux: {
          summary: "The review of UX",
          findings: ["UX finding one", "UX finding two"],
          score: "7/10",
        },
        a11y: {
          summary: "The review of accessibility",
          findings: ["ACC finding one", "ACC finding two"],
          score: "8/10",
        },
        i18n: {
          summary: "The review of i18n",
          findings: ["i18n finding one", "i18n finding two"],
          score: "6/10",
        },
      },
      goalAchieved: false,
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
    const previousIntents: AutoPreviousStep[] = [
      {
        screenDescription: "default",
        step: "previous intent",
        review: {
          ux: {
            summary: "Previous UX summary",
            findings: ["Previous UX finding"],
            score: "6/10",
          },
          a11y: {
            summary: "Previous Accessibility summary",
            findings: ["Previous ACC finding"],
            score: "7/10",
          },
          i18n: {
            summary: "Previous i18n summary",
            findings: ["Previous i18n finding"],
            score: "5/10",
          },
        },
      },
    ];

    setupMocks();

    const result = await pilotPerformer.analyseScreenAndCreatePilotStep(
      intent,
      previousIntents,
      mockCaptureResult,
    );

    const expectedResult = {
      screenDescription: "default name",
      plan: {
        thoughts: "I think this is great",
        action: "Tap on GREAT button",
      },
      review: {
        ux: {
          summary: "The review of UX",
          findings: ["UX finding one", "UX finding two"],
          score: "7/10",
        },
        a11y: {
          summary: "The review of accessibility",
          findings: ["ACC finding one", "ACC finding two"],
          score: "8/10",
        },
        i18n: {
          summary: "The review of i18n",
          findings: ["i18n finding one", "i18n finding two"],
          score: "6/10",
        },
      },
      goalAchieved: false,
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
      const pilotOutputStep1: AutoStepReport = {
        screenDescription: "Screen 1",
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
          i18n: {
            summary: "i18n review for step 1",
            findings: [],
            score: "6/10",
          },
        },
        goalAchieved: false,
      };

      const pilotOutputSuccess: AutoStepReport = {
        screenDescription: "Screen 2",
        plan: {
          thoughts: "Completed successfully",
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
          i18n: {
            summary: "Final i18n review",
            findings: [],
            score: "8/10",
          },
        },
        goalAchieved: true,
        summary: "all was good",
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
        .spyOn(pilotPerformer, "analyseScreenAndCreatePilotStep")
        .mockResolvedValueOnce(pilotOutputStep1)
        .mockResolvedValueOnce(pilotOutputSuccess);

      jest.spyOn(mockStepPerformer, "perform").mockResolvedValue({
        code: "code executed",
        result: "result of execution",
      });

      const result = await pilotPerformer.perform(GOAL);

      expect(mockScreenCapturer.capture).toHaveBeenCalledTimes(2);
      expect(analyseScreenAndCreateCopilotStep).toHaveBeenCalledTimes(2);

      const expectedReport: AutoReport = {
        summary: "all was good",
        goal: GOAL,
        steps: [
          {
            screenDescription: "Screen 1",
            plan: pilotOutputStep1.plan,
            code: "code executed",
            review: pilotOutputStep1.review,
            goalAchieved: false,
          },
        ],
        review: pilotOutputSuccess.review,
      };

      expect(result).toEqual(expectedReport);
    });
  });
});
