import { APIFormatter } from "@/utils/APIFormatter";
import { TestingFrameworkAPICatalog } from "@/types";

describe("APIFormatter", () => {
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

  let apiFormatter: APIFormatter;

  beforeEach(() => {
    apiFormatter = new APIFormatter(mockAPI);
  });

  describe("formatAPIMethod", () => {
    it("should format method with guidelines", () => {
      const method = mockAPI.categories[0].items[0];
      expect(apiFormatter.formatAPIMethod(method)).toMatchSnapshot();
    });

    it("should format method without guidelines", () => {
      const method = {
        ...mockAPI.categories[0].items[0],
        guidelines: undefined,
      };
      expect(apiFormatter.formatAPIMethod(method)).toMatchSnapshot();
    });
  });

  describe("formatAPICategory", () => {
    it("should format category with all its methods", () => {
      const category = mockAPI.categories[0];
      expect(apiFormatter.formatAPICategory(category)).toMatchSnapshot();
    });

    it("should format empty category", () => {
      const category = {
        title: "Empty Category",
        items: [],
      };
      expect(apiFormatter.formatAPICategory(category)).toMatchSnapshot();
    });
  });

  describe("formatAPIInfo", () => {
    it("should format all methods grouped by categories", () => {
      expect(apiFormatter.formatAPIInfo()).toMatchSnapshot();
    });

    it("should format empty API catalog", () => {
      const emptyFormatter = new APIFormatter({
        context: {},
        categories: [],
      });
      expect(emptyFormatter.formatAPIInfo()).toMatchSnapshot();
    });
  });
});
