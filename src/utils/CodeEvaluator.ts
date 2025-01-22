import { CodeEvaluationError } from '@/errors/CodeEvaluationError';
import {CodeEvaluationResult} from "@/types";

export class CodeEvaluator {
    async evaluate(code: string, context: any, sharedContext: Record<string, any> = {}): Promise<CodeEvaluationResult> {
        const asyncFunction = this.createAsyncFunction(code, context, sharedContext);
        const result = await asyncFunction();

        return { code, result, sharedContext }
    }

    private createAsyncFunction(code: string, context: any, sharedContext: Record<string, any>): Function {
        // todo: this is a temp log for debugging, we'll need to pass a logging mechanism from the framework.
        console.log("\x1b[90m%s\x1b[0m\x1b[92m%s\x1b[0m", "Copilot evaluating code block:\n", `${code}\n`);

        try {
            const contextValues = Object.values(context);

            // Wrap the code in an immediately-invoked async function expression (IIFE), and inject context variables into the function
            return new Function(...Object.keys(context), 'sharedContext', `return (async () => { 
              ${code}
            })();`).bind(null, ...contextValues, sharedContext);
        } catch (error) {
            const underlyingErrorMessage = (error as Error)?.message;
            throw new CodeEvaluationError(
                `Failed to execute test step code, error: ${underlyingErrorMessage}:\n\`\`\`\n${code}\n\`\`\``
            );
        }
    }
}
