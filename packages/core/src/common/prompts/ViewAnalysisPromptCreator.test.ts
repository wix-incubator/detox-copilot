import { ViewAnalysisPromptCreator } from "@/common/prompts/ViewAnalysisPromptCreator";
import { TestingFrameworkAPICatalog } from "@/types";

describe("ViewAnalysisPromptCreator", () => {
  const mockAPI: TestingFrameworkAPICatalog = {
    context: {},
    name: "Test Framework",
    description: "A testing framework for testing purposes",
    categories: [],
  };

  let analyzer: ViewAnalysisPromptCreator;

  beforeEach(() => {
    analyzer = new ViewAnalysisPromptCreator(mockAPI);
  });

  it("should create the prompt properly", () => {
    const step = "tap the login button";
    const viewHierarchy =
      '<View><Button testID="login" title="Login" /></View>';
    const prompt = analyzer.createPrompt(step, viewHierarchy);

    expect(prompt).toMatchSnapshot();
  });

  it("should include previous steps in the prompt when provided", () => {
    const step = "tap the login button";
    const viewHierarchy =
      '<View><Button testID="login" title="Login" /></View>';
    const previousSteps = [
      {
        step: "navigate to login screen",
        code: 'await element(by.id("login")).tap();',
        result: "success",
      },
      {
        step: "enter username",
        code: 'await element(by.id("username")).typeText("john_doe");',
        result: "john doe",
      },
    ];

    const prompt = analyzer.createPrompt(step, viewHierarchy, previousSteps);

    expect(prompt).toMatchSnapshot();
  });

  it("should handle empty view hierarchy", () => {
    const step = "tap the login button";
    const viewHierarchy = "";
    const prompt = analyzer.createPrompt(step, viewHierarchy);

    expect(prompt).toMatchSnapshot();
  });
});
