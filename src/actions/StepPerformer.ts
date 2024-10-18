import {PromptCreator} from '@/utils/PromptCreator';
import {CodeEvaluator} from '@/utils/CodeEvaluator';
import {SnapshotManager} from '@/utils/SnapshotManager';
import {CodeEvaluationResult, PreviousStep, PromptHandler} from '@/types';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {extractCodeBlock} from '@/utils/extractCodeBlock';

export class StepPerformer {
    private cache: Map<string, any> = new Map();
    private readonly cacheFilePath: string;

    constructor(
        private context: any,
        private promptCreator: PromptCreator,
        private codeEvaluator: CodeEvaluator,
        private snapshotManager: SnapshotManager,
        private promptHandler: PromptHandler,
        cacheFileName: string = 'detox_copilot_cache.json',
    ) {
        this.cacheFilePath = path.resolve(process.cwd(), cacheFileName);
    }

    private generateCacheKey(step: string, previous: PreviousStep[], viewHierarchy: string): string {
        const viewHierarchyHash = crypto.createHash('md5').update(viewHierarchy).digest('hex');
        return JSON.stringify({ step, previous, viewHierarchyHash });
    }

    private loadCacheFromFile(): void {
        try {
            if (fs.existsSync(this.cacheFilePath)) {
                const data = fs.readFileSync(this.cacheFilePath, 'utf-8');
                const json = JSON.parse(data);
                this.cache = new Map(Object.entries(json));
            } else {
                this.cache.clear(); // Ensure cache is empty if file doesn't exist
            }
        } catch (error) {
            console.warn('Error loading cache from file:', error);
            this.cache.clear(); // Clear cache on error to avoid stale data
        }
    }

    private saveCacheToFile(): void {
        try {
            const json = Object.fromEntries(this.cache);
            fs.writeFileSync(this.cacheFilePath, JSON.stringify(json, null, 2), { flag: 'w+' });
        } catch (error) {
            console.error('Error saving cache to file:', error);
        }
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

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        } else {
            const prompt = this.promptCreator.createPrompt(step, viewHierarchy, isSnapshotImageAttached, previous);
            const promptResult = await this.promptHandler.runPrompt(prompt, snapshot);
            const code = extractCodeBlock(promptResult);

            this.cache.set(cacheKey, code);
            this.saveCacheToFile();

            return code;
        }
    }

    async perform(step: string, previous: PreviousStep[] = [], attempts: number = 2): Promise<CodeEvaluationResult> {
        // TODO: replace with the user's logger
        console.log('\x1b[90m%s\x1b[0m%s', 'Copilot performing:', `"${step}"`);

        this.loadCacheFromFile();

        let lastError: any = null;
        let lastCode: string | undefined;

        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                console.log('\x1b[90m%s\x1b[0m', `Attempt ${attempt} for step: "${step}"`);

                // Capture updated snapshot and view hierarchy on each attempt
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
                        ? `Failed to evaluate "${step}", tried with generated code: "${lastCode}". Validate the code against the APIs and hierarchy and let's try a different approach. If can't, return a code that throws a descriptive error.`
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
