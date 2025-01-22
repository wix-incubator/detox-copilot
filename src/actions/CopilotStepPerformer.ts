import {PromptCreator} from '@/utils/PromptCreator';
import {CodeEvaluator} from '@/utils/CodeEvaluator';
import {CopilotAPISearchPromptCreator} from '@/utils/CopilotAPISearchPromptCreator';
import {ViewAnalysisPromptCreator} from '@/utils/ViewAnalysisPromptCreator';
import {CacheHandler} from '@/utils/CacheHandler';
import {SnapshotComparator} from '@/utils/SnapshotComparator';
import {AnalysisMode, CacheMode, CodeEvaluationResult, PreviousStep, PromptHandler, ScreenCapturerResult, type CacheValues, type SingleCacheValue} from '@/types';
import * as crypto from 'crypto';
import {extractCodeBlock} from '@/utils/extractCodeBlock';

export class CopilotStepPerformer {
    private readonly cacheMode: CacheMode;
    private readonly analysisMode: AnalysisMode;

    constructor(
        private context: any,
        private promptCreator: PromptCreator,
        private apiSearchPromptCreator: CopilotAPISearchPromptCreator,
        private viewAnalysisPromptCreator: ViewAnalysisPromptCreator,
        private codeEvaluator: CodeEvaluator,
        private promptHandler: PromptHandler,
        private cacheHandler: CacheHandler,
        private snapshotComparator: SnapshotComparator,
        cacheMode: CacheMode = 'full',
        analysisMode: AnalysisMode = 'fast',
    ) {
        this.cacheMode = cacheMode;
        this.analysisMode = analysisMode;
    }

    extendJSContext(newContext: any): void {
        for (const key in newContext) {
            if (key in this.context) {
                console.log(`Notice: Context ${key} is overridden by the new context value`);
                break;
            }
        }
        this.context = {...this.context, ...newContext};
    }

    private generateCacheKey(step: string, previous: PreviousStep[]): string | undefined {
        if (this.cacheMode === 'disabled') {
            // Return a unique key that won't match any cached value
            return undefined;
        }

        const cacheKeyData: any = {step, previous};

        return JSON.stringify(cacheKeyData);
    }

    private async generateCacheValue(code: string ,viewHierarchy: string, snapshot:any) : Promise<SingleCacheValue | undefined> {
        if (this.cacheMode === 'disabled') {
            throw new Error('Cache is disabled');
        }

        if(this.cacheMode === 'lightweight') {
            return {code};
        }

        const snapshotHashes = snapshot && await this.snapshotComparator.generateHashes(snapshot);

        return {
            code,
            viewHierarchy: crypto.createHash('md5').update(viewHierarchy).digest('hex'), 
            snapshotHash: snapshotHashes
        };
    }

    private findCodeInCacheValue(cacheValue: CacheValues, viewHierarchy: string, snapshot: any): string | undefined {
        if (this.cacheMode === 'lightweight') {
            return cacheValue[0].code;
        }

        const viewHierarchyHash = crypto.createHash('md5').update(viewHierarchy).digest('hex');
        return cacheValue.find((cachedCode) => {
                if (cachedCode.viewHierarchy === viewHierarchyHash) {
                return cachedCode.code;
            }
        })?.code;
    }

    private shouldOverrideCache() {
        return process.env.COPILOT_OVERRIDE_CACHE === "true" || process.env.COPILOT_OVERRIDE_CACHE === "1";
    }

    private async generateCode(
        step: string,
        previous: PreviousStep[],
        snapshot: string | undefined,
        viewHierarchy: string,
        isSnapshotImageAttached: boolean,
    ): Promise<string> {
        const cacheKey = this.generateCacheKey(step, previous);

        const cachedValue = cacheKey && this.cacheHandler.getStepFromCache(cacheKey);
        if (!this.shouldOverrideCache() && cachedValue) {
            const code = this.findCodeInCacheValue(cachedValue, viewHierarchy, snapshot);
            if (code) {
                return code;
            }
        }  
        let viewAnalysisResult = '';
        let apiSearchResult = '';

        if (this.analysisMode === 'full') {
            // Perform view hierarchy analysis and API search only in full mode
            viewAnalysisResult = await this.promptHandler.runPrompt(
                this.viewAnalysisPromptCreator.createPrompt(step, viewHierarchy, previous),
                undefined
            );

            apiSearchResult = await this.promptHandler.runPrompt(
                this.apiSearchPromptCreator.createPrompt(step, viewAnalysisResult),
                undefined
            );
        }

        const prompt = this.promptCreator.createPrompt(
            step,
            viewHierarchy,
            isSnapshotImageAttached,
            previous,
            apiSearchResult
        );

        const promptResult = await this.promptHandler.runPrompt(prompt, snapshot);
        const code = extractCodeBlock(promptResult);
        if (this.cacheMode !== 'disabled') {
            const newCacheValue = await this.generateCacheValue(code, viewHierarchy, snapshot)
            this.cacheHandler.addToTemporaryCache(cacheKey!, newCacheValue);
        }

        return code;
    }

    async perform(step: string, previous: PreviousStep[] = [], screenCapture : ScreenCapturerResult, attempts: number = 2): Promise<CodeEvaluationResult> {
        // TODO: replace with the user's logger
        console.log('\x1b[90m%s\x1b[0m%s', 'Copilot performing:', `"${step}"`);

        this.cacheHandler.loadCacheFromFile();

        let lastError: any = null;
        let lastCode: string | undefined;

        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                const {snapshot, viewHierarchy, isSnapshotImageAttached} = screenCapture;

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
