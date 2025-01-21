import {PromptCreator} from '@/utils/PromptCreator';
import {CodeEvaluator} from '@/utils/CodeEvaluator';
import {SnapshotManager} from '@/utils/SnapshotManager';
import {CacheHandler} from '@/utils/CacheHandler';
import {SnapshotComparator} from '@/utils/SnapshotComparator';
import {CacheMode, CodeEvaluationResult, PreviousStep, PromptHandler, ScreenCapturerResult, CacheValue} from '@/types';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {extractCodeBlock} from '@/utils/extractCodeBlock';

export class CopilotStepPerformer {
    private readonly cacheMode: CacheMode;
    

    constructor(
        private context: any,
        private promptCreator: PromptCreator,
        private codeEvaluator: CodeEvaluator,
        private snapshotManager: SnapshotManager,
        private promptHandler: PromptHandler,
        private cacheHandler: CacheHandler,
        private snapshotComparator: SnapshotComparator,
        cacheMode: CacheMode = 'full',
    ) {
        this.cacheMode = cacheMode;
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

    private generateCacheKey(step: string, previous: PreviousStep[]): string {
        if (this.cacheMode === 'disabled') {
            // Return a unique key that won't match any cached value
            return crypto.randomUUID();
        }

        const cacheKeyData: any = {step, previous};
        
        // if (this.cacheMode === 'full') {
        //     const viewHierarchyHash = crypto.createHash('md5').update(viewHierarchy).digest('hex');
        //     cacheKeyData.viewHierarchyHash = viewHierarchyHash;
        // }

        return JSON.stringify(cacheKeyData);
    }

    private async generateCacheValue(code: string ,viewHierarchy: string, snapshot:any) : Promise<CacheValue> {
        if (this.cacheMode === 'disabled') {
            return [];
        }

        if(this.cacheMode === 'lightweight') {
            return [{code}];
        }

        const snapshotHashes = await this.snapshotComparator.generateHashes(snapshot);
        return [{
            code,
            viewHierarchy: crypto.createHash('md5').update(viewHierarchy).digest('hex'), 
            snapshotHash: snapshotHashes
        }];
    }

    private findCodeInCacheValue(cacheValue: CacheValue, viewHierarchy: string, snapshot: any): string | undefined {
        for (const cachedCode of cacheValue) {
            if (cachedCode.viewHierarchy === crypto.createHash('md5').update(viewHierarchy).digest('hex')) {
                return cachedCode.code;
            }
        }
        return undefined;
    }

    private shouldOverrideCache() {
        return process.env.COPILOT_OVERRIDE_CACHE === "true" || process.env.COPILOT_OVERRIDE_CACHE === "1";
    }

    private async generateCode(
        step: string,
        previous: PreviousStep[],
        snapshot: any,
        viewHierarchy: string,
        isSnapshotImageAttached: boolean,
    ): Promise<string> {
        const cacheKey = this.generateCacheKey(step, previous);

        const cachedValue = this.cacheHandler.getStepFromCache(cacheKey);
        if (!this.shouldOverrideCache() && cachedValue) {
            const code = this.findCodeInCacheValue(cachedValue, viewHierarchy, snapshot);
            if (code) {
                return code;
            }
        } 
        const prompt = this.promptCreator.createPrompt(step, viewHierarchy, isSnapshotImageAttached, previous);
        const promptResult = await this.promptHandler.runPrompt(prompt, snapshot);
        const code = extractCodeBlock(promptResult);
        const newCacheValue = await this.generateCacheValue(code, viewHierarchy, snapshot)

        newCacheValue && this.cacheHandler.addToTemporaryCache(cacheKey, newCacheValue);

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
