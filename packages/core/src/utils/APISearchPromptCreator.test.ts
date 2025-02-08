import { APISearchPromptCreator } from "@/utils/APISearchPromptCreator";
import { TestingFrameworkAPICatalog } from "@/types";

describe("APISearchPromptCreator", () => {
  const mockAPI: TestingFrameworkAPICatalog = {
    context: {},
    name: "Test Framework",
    description: "A testing framework for testing purposes",
    categories: [
      {
        title: "Actions",
        items: [
          {
            signature: "tap(element: Element)",
            description: "Taps on the specified element.",
            example: 'await element(by.id("button")).tap();',
            guidelines: [
              "Ensure the element is tappable before using this method.",
            ],
          },
          {
            signature: "typeText(element: Element, text: string)",
            description: "Types the specified text into the element.",
            example: 'await element(by.id("input")).typeText("Hello, World!");',
            guidelines: ["Use this method only on text input elements."],
          },
        ],
      },
      {
        title: "Assertions",
        items: [
          {
            signature: "toBeVisible()",
            description: "Asserts that the element is visible on the screen.",
            example: 'await expect(element(by.id("title"))).toBeVisible();',
            guidelines: ["Consider scroll position when using this assertion."],
          },
        ],
      },
      {
        title: "Matchers",
        items: [
          {
            signature: "by.id(id: string)",
            description: "Matches elements by their ID attribute.",
            example: 'element(by.id("uniqueId"))',
            guidelines: ["Use unique IDs for elements to avoid conflicts."],
          },
        ],
      },
    ],
  };

  let promptCreator: APISearchPromptCreator;

  beforeEach(() => {
    promptCreator = new APISearchPromptCreator(mockAPI);
  });

  it("should create the prompt properly", () => {
    const step = "tap the login button";
    const prompt = promptCreator.createPrompt(step);

    expect(prompt).toMatchSnapshot();
  });

  it("should include view analysis result when provided", () => {
    const step = "tap the login button";
    const viewAnalysisResult =
      "Basic Element Description:\nA button in a navigation bar\n\nElement Location Analysis:\n...";
    const prompt = promptCreator.createPrompt(step, viewAnalysisResult);

    expect(prompt).toMatchSnapshot();
  });

  it("should handle empty API catalog", () => {
    const emptyAPICreator = new APISearchPromptCreator({
      context: {},
      categories: [],
    });
    const step = "tap the login button";
    const prompt = emptyAPICreator.createPrompt(step);

    expect(prompt).toMatchSnapshot();
  });

  it("should handle complex multi-step intent", () => {
    const step =
      'scroll to the bottom of the list, find the last item with title "Complete", and verify it is visible';
    const prompt = promptCreator.createPrompt(step);

    expect(prompt).toMatchSnapshot();
  });

  it("should handle special characters in step", () => {
    const step = 'verify text contains "Hello & goodbye" with <special> chars';
    const prompt = promptCreator.createPrompt(step);

    expect(prompt).toMatchSnapshot();
  });

  it("should handle empty view analysis result", () => {
    const step = "tap the login button";
    const viewAnalysisResult = "";
    const prompt = promptCreator.createPrompt(step, viewAnalysisResult);

    expect(prompt).toMatchSnapshot();
  });
});
