import {PromptCreator} from '@/utils/PromptCreator';
import {CodeEvaluator} from '@/utils/CodeEvaluator';
import {SnapshotManager} from '@/utils/SnapshotManager';
import {CacheHandler} from '@/utils/CacheHandler';
import {CodeEvaluationResult, PreviousStep, PromptHandler} from '@/types';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {extractCodeBlock} from '@/utils/extractCodeBlock';

export class StepPerformer {
    constructor(
        private context: any,
        private promptCreator: PromptCreator,
        private codeEvaluator: CodeEvaluator,
        private snapshotManager: SnapshotManager,
        private promptHandler: PromptHandler,
        private cacheHandler: CacheHandler,
    ) {
    }

    private generateCacheKey(step: string, previous: PreviousStep[], viewHierarchy: string): string {
        const viewHierarchyHash = crypto.createHash('md5').update(viewHierarchy).digest('hex');
        return JSON.stringify({ step, previous, viewHierarchyHash });
    }

    private async captureSnapshotAndViewHierarchy() {
        const snapshot = this.promptHandler.isSnapshotImageSupported()
            ? await this.snapshotManager.captureSnapshotImage()
            : undefined;
        const viewHierarchy = await this.snapshotManager.captureViewHierarchyString();

        const isSnapshotImageAttached = snapshot != null && this.promptHandler.isSnapshotImageSupported();

        return { snapshot, viewHierarchy, isSnapshotImageAttached };
    }

    private async generateCode(
        step: string,
        previous: PreviousStep[],
        snapshot: any,
        viewHierarchy: string,
        isSnapshotImageAttached: boolean,
    ): Promise<string> {
        const cacheKey = this.generateCacheKey(step, previous, viewHierarchy);

        const cachedCode = this.cacheHandler.getStepFromCache(cacheKey);
        if (cachedCode) {
            return cachedCode;
        } else {
            const prompt = this.promptCreator.createPrompt(step, viewHierarchy, isSnapshotImageAttached, previous);
            const promptResult = await this.promptHandler.runPrompt(prompt, snapshot);
            const code = extractCodeBlock(promptResult);

            this.cacheHandler.addToTemporaryCache(cacheKey, code);

            return code;
        }
    }

    async perform(step: string, previous: PreviousStep[] = [], attempts: number = 2): Promise<CodeEvaluationResult> {
        // TODO: replace with the user's logger
        console.log('\x1b[90m%s\x1b[0m%s', 'Copilot performing:', `"${step}"`);

        this.cacheHandler.loadCacheFromFile();

        let lastError: any = null;
        let lastCode: string | undefined;

        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                const { snapshot, viewHierarchy, isSnapshotImageAttached } = await this.captureSnapshotAndViewHierarchy();

                const code = await this.generateCode(step, previous, snapshot, viewHierarchy, isSnapshotImageAttached);
                lastCode = code;

                if (!code) {
                    throw new Error('Failed to generate code from intent');
                }

                return await this.codeEvaluator.evaluate(code, this.context);
            } catch (error) {
                lastError = error;
                console.log('\x1b[33m%s\x1b[0m', `Attempt ${attempt} failed for step "${step}": ${error instanceof Error ? error.message : error}`);

                if (attempt < attempts) {
                    console.log('\x1b[33m%s\x1b[0m', 'Copilot is retrying...');

                    const resultMessage = lastCode
                        ? `Caught an error while evaluating "${step}", tried with generated code: "${lastCode}". Validate the code against the APIs and hierarchy and continue with a different approach. If can't, return a code that throws a descriptive error.`
                        : `Failed to perform "${step}", could not generate prompt result. Let's try a different approach. If can't, return a code that throws a descriptive error.`;

                    previous = [
                        ...previous,
                        {
                            step,
                            code: lastCode ?? 'undefined',
                            result: resultMessage,
                        },
                    ];
                }
            }
        }

        throw lastError;
    }
}
