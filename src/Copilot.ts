import {CopilotError} from "@/errors/CopilotError";
import {PromptCreator} from "@/utils/PromptCreator";
import {CodeEvaluator} from "@/utils/CodeEvaluator";
import {SnapshotManager} from "@/utils/SnapshotManager";
import {StepPerformer} from "@/actions/StepPerformer";
import {Config, PreviousStep, TestingFrameworkAPICatalogCategory, PilotReport} from "@/types";
import {CacheHandler} from "@/utils/CacheHandler";
import {PilotPerformer} from "@/actions/PilotPerformer";
import {PilotPromptCreator} from "@/utils/PilotPromptCreator";
/**
 * The main Copilot class that provides AI-assisted testing capabilities for a given underlying testing framework.
 * @note Originally, this class is designed to work with Detox, but it can be extended to work with other frameworks.
 */
export class Copilot {
    // Singleton instance of Copilot
    static instance?: Copilot;

    private readonly promptCreator: PromptCreator;
    private readonly codeEvaluator: CodeEvaluator;
    private readonly snapshotManager: SnapshotManager;
    private previousSteps: PreviousStep[] = [];
    private stepPerformer: StepPerformer;
    private cacheHandler: CacheHandler;
    private isRunning: boolean = false;
    private pilotPerformer : PilotPerformer;
    private pilotPromptCreator : PilotPromptCreator;

    private constructor(config: Config) {
        this.promptCreator = new PromptCreator(config.frameworkDriver.apiCatalog);
        this.codeEvaluator = new CodeEvaluator();
        this.snapshotManager = new SnapshotManager(config.frameworkDriver);
        this.pilotPromptCreator = new PilotPromptCreator();
        this.cacheHandler = new CacheHandler();
        this.stepPerformer = new StepPerformer(
            config.frameworkDriver.apiCatalog.context,
            this.promptCreator,
            this.codeEvaluator,
            this.snapshotManager,
            config.promptHandler,
            this.cacheHandler
        );
        this.pilotPerformer = new PilotPerformer(this.pilotPromptCreator, this.stepPerformer, config.promptHandler, () => this.previousSteps);

    }

    static isInitialized(): boolean {
        return !!Copilot.instance;
    }

    /**
     * Gets the singleton instance of Copilot.
     * @returns The Copilot instance.
     */
    static getInstance(): Copilot {
        if (!Copilot.instance) {
            throw new CopilotError('Copilot has not been initialized. Please call the `init()` method before using it.');
        }

        return Copilot.instance;
    }

    /**
     * Initializes the Copilot with the provided configuration, must be called before using Copilot.
     * @param config The configuration options for Copilot.
     */
    static init(config: Config): void {
        if (Copilot.instance) {
            throw new CopilotError('Copilot has already been initialized. Please call the `init()` method only once.');
        }

        Copilot.instance = new Copilot(config);
    }

    /**
     * Performs a test step based on the given prompt.
     * @param step The step describing the operation to perform.
     */
    async performStep(step: string): Promise<any> {
        if (!this.isRunning) {
            throw new CopilotError('Copilot is not running. Please call the `start()` method before performing any steps.');
        }

        const {code, result} = await this.stepPerformer.perform(step, this.previousSteps);
        this.didPerformStep(step, code, result);
        return result;
    }

    /**
     * Starts the Copilot by clearing the previous steps and temporary cache.
     * @note This must be called before starting a new test flow, in order to clean context from previous tests.
     */
    start(): void {
        if (this.isRunning) {
            throw new CopilotError('Copilot was already started. Please call the `end()` method before starting a new test flow.');
        }

        this.isRunning = true;
        this.previousSteps = [];
        this.cacheHandler.clearTemporaryCache();
    }

    /**
     * Ends the Copilot test flow and optionally saves the temporary cache to the main cache.
     * @param isCacheDisabled -  boolean flag indicating whether the temporary cache data should be saved to the main cache.
     */
    end(isCacheDisabled: boolean = false): void {
        if (!this.isRunning) {
            throw new CopilotError('Copilot is not running. Please call the `start()` method before ending the test flow.');
        }

        this.isRunning = false;

        if (!isCacheDisabled)
            this.cacheHandler.flushTemporaryCache();
    }

    /**
     * Enriches the API catalog by adding the provided categories and JS context.
     * @param categories - The categories to register.
     * @param context - (Optional) Additional JS context to register.
     */
    extendAPICatalog(categories: TestingFrameworkAPICatalogCategory[], context?: any): void {
        this.promptCreator.extendAPICategories(categories);
        if (context)
            this.stepPerformer.extendJSContext(context);
    }

    private didPerformStep(step: string, code: string, result: any): void {
        this.previousSteps = [...this.previousSteps, {
            step,
            code,
            result
        }];
    }
     /**
     * Performs an entire test flow using the provided goal.
     * @param goal A string which describes the flow should be executed.
     * @returns void
     */
     async pilot(goal :string) : Promise<PilotReport> {
        return await this.pilotPerformer.perform(goal);
     }
}
