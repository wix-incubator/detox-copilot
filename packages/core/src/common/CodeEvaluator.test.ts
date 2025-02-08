import { CodeEvaluator } from "./CodeEvaluator";

describe("CodeEvaluator", () => {
  let codeEvaluator: CodeEvaluator;

  beforeEach(() => {
    codeEvaluator = new CodeEvaluator();
  });

  it("should evaluate valid code successfully", async () => {
    const validCode = "return 2 + 2;";
    await expect(codeEvaluator.evaluate(validCode, {})).resolves.not.toThrow();
  });

  it("should evaluate valid code with comments successfully", async () => {
    const validCode = "return 2 + 2; // This is a comment";
    await expect(codeEvaluator.evaluate(validCode, {})).resolves.not.toThrow();
  });

  it("should evaluate valid code with multiple lines successfully", async () => {
    const validCode = "return 2 + 2;\nreturn 3 + 3;";
    await expect(codeEvaluator.evaluate(validCode, {})).resolves.not.toThrow();
  });

  it("should evaluate valid code with context successfully", async () => {
    const contextVariable = 43;
    const validCode = "return contextVariable - 1;";

    await expect(
      codeEvaluator.evaluate(validCode, { contextVariable }),
    ).resolves.toStrictEqual({
      code: "return contextVariable - 1;",
      result: 42,
      sharedContext: {},
    });
  });

  it("should throw CodeEvaluationError for invalid code", async () => {
    const invalidCode = 'throw new Error("Test error");';
    await expect(codeEvaluator.evaluate(invalidCode, {})).rejects.toThrow(
      new Error("Test error"),
    );
  });

  it("should handle asynchronous code", async () => {
    const asyncCode =
      'await new Promise(resolve => setTimeout(resolve, 100)); return "done";';

    await expect(codeEvaluator.evaluate(asyncCode, {})).resolves.toStrictEqual({
      code: 'await new Promise(resolve => setTimeout(resolve, 100)); return "done";',
      result: "done",
      sharedContext: {},
    });
  });

  it("should throw CodeEvaluationError with original error message", async () => {
    const errorCode = 'throw new Error("Custom error message");';
    await expect(codeEvaluator.evaluate(errorCode, {})).rejects.toThrow(
      new Error("Custom error message"),
    );
  });

  describe("shared context", () => {
    it("should allow reading from shared context", async () => {
      const sharedContext = { value: 42 };
      const code = "return sharedContext.value;";

      const result = await codeEvaluator.evaluate(code, {}, sharedContext);

      expect(result).toStrictEqual({
        code,
        result: 42,
        sharedContext: { value: 42 },
      });
    });

    it("should allow writing to shared context", async () => {
      const sharedContext = { value: 42 };
      const code =
        "sharedContext.newValue = sharedContext.value * 2; return true;";

      const result = await codeEvaluator.evaluate(code, {}, sharedContext);

      expect(result).toStrictEqual({
        code,
        result: true,
        sharedContext: { value: 42, newValue: 84 },
      });
    });

    it("should preserve shared context between evaluations", async () => {
      const sharedContext = {};

      // First evaluation stores a value
      await codeEvaluator.evaluate(
        "sharedContext.value = 42;",
        {},
        sharedContext,
      );

      // Second evaluation uses the stored value
      const result = await codeEvaluator.evaluate(
        "return sharedContext.value;",
        {},
        sharedContext,
      );

      expect(result).toStrictEqual({
        code: "return sharedContext.value;",
        result: 42,
        sharedContext: { value: 42 },
      });
    });

    it("should handle undefined shared context", async () => {
      const code = "return 42;";

      const result = await codeEvaluator.evaluate(code, {});

      expect(result).toStrictEqual({
        code,
        result: 42,
        sharedContext: {},
      });
    });

    it("should handle complex shared context operations", async () => {
      const sharedContext = { users: [] };
      const code = `
                sharedContext.users.push({ id: 1, name: 'Alice' });
                sharedContext.users.push({ id: 2, name: 'Bob' });
                return sharedContext.users.length;
            `;

      const result = await codeEvaluator.evaluate(code, {}, sharedContext);

      expect(result).toStrictEqual({
        code,
        result: 2,
        sharedContext: {
          users: [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
          ],
        },
      });
    });
  });
});
