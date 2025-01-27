import { PilotPromptCreator } from "./PilotPromptCreator";
import { PilotPreviousStep } from "@/types";

describe("PilotPromptCreator", () => {
  let promptCreator: PilotPromptCreator;

  beforeEach(() => {
    promptCreator = new PilotPromptCreator();
  });

  it("should create a prompt for an intent correctly", () => {
    const intent = "tap button";
    const viewHierarchy =
      '<View><Button testID="submit" title="Submit" /></View>';
    const prompt = promptCreator.createPrompt(intent, viewHierarchy, true, []);
    expect(prompt).toMatchSnapshot();
  });

  it("should include previous intents in the context", () => {
    const intent = "tap button";
    const previousSteps: PilotPreviousStep[] = [
      {
        screenDescription: "default 1",
        step: "navigate to login screen",
        
      },
      {
        screenDescription: "default 2",
        step: "enter username",
      },
    ];

    const viewHierarchy =
      '<View><Button testID="submit" title="Submit" /></View>';

    const prompt = promptCreator.createPrompt(
      intent,
      viewHierarchy,
      false,
      previousSteps,
    );

    expect(prompt).toMatchSnapshot();
  });

  it("should handle when no snapshot image is attached", () => {
    const intent = "expect button to be visible";
    const viewHierarchy =
      '<View><Button testID="submit" title="Submit" /></View>';

    const prompt = promptCreator.createPrompt(intent, viewHierarchy, false, []);

    expect(prompt).toMatchSnapshot();
  });
});
