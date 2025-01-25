import { CodeEvaluationError } from "@/errors/CodeEvaluationError";
import { CodeEvaluationResult } from "@/types";
import logger from "@/utils/logger";

export class CodeEvaluator {
  async evaluate(
    code: string,
    context: any,
    sharedContext: Record<string, any> = {},
  ): Promise<CodeEvaluationResult> {
    const loggerSpinner = logger.startSpinner({
      message: `Copilot evaluating code: \n\`\`\`\n${code}\n\`\`\`\n`,
      isBold: false,
      color: "gray",
    });

    const asyncFunction = this.createAsyncFunction(
      code,
      context,
      sharedContext,
    );

    try {
      const result = await asyncFunction();
      loggerSpinner.stop("success", `Copilot evaluated the code successfully`);

      return { code, result, sharedContext };
    } catch (error) {
      loggerSpinner.stop("failure", {
        message: `Copilot failed to evaluate the code: \n\`\`\`\n${code}\n\`\`\``,
        isBold: false,
        color: "gray",
      });

      throw error;
    }
  }

  private createAsyncFunction(
    code: string,
    context: any,
    sharedContext: Record<string, any>,
  ): () => Promise<any> {
    try {
      const contextValues = Object.values(context);

      // Wrap the code in an immediately-invoked async function expression (IIFE), and inject context variables into the function
      return new Function(
        ...Object.keys(context),
        "sharedContext",
        `return (async () => { 
              ${code}
            })();`,
      ).bind(null, ...contextValues, sharedContext);
    } catch (error) {
      const underlyingErrorMessage = (error as Error)?.message;
      throw new CodeEvaluationError(
        `Failed to execute test step code, error: ${underlyingErrorMessage}:\n\`\`\`\n${code}\n\`\`\``,
      );
    }
  }
}
