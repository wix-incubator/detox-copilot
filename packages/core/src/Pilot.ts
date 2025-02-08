import { PilotError } from "@/errors/PilotError";
import { StepPerformerPromptCreator } from "@/performers/step-performer/StepPerformerPromptCreator";
import { CodeEvaluator } from "@/common/CodeEvaluator";
import { SnapshotManager } from "@/common/snapshot/SnapshotManager";
import { StepPerformer } from "./performers/step-performer/StepPerformer";
import {
  Config,
  PreviousStep,
  TestingFrameworkAPICatalogCategory,
  AutoReport,
  ScreenCapturerResult,
} from "./types";
import { StepPerformerCacheHandler } from "@/performers/step-performer/StepPerformerCacheHandler";
import { SnapshotComparator } from "@/common/snapshot/comparator/SnapshotComparator";
import { AutoPerformer } from "./performers/auto-performer/AutoPerformer";
import { AutoPerformerPromptCreator } from "@/performers/auto-performer/AutoPerformerPromptCreator";
import { ScreenCapturer } from "@/common/snapshot/ScreenCapturer";
import { APISearchPromptCreator } from "@/common/prompts/APISearchPromptCreator";
import { ViewAnalysisPromptCreator } from "@/common/prompts/ViewAnalysisPromptCreator";
import downscaleImage from "@/common/snapshot/downscaleImage";

/**
 * The main Pilot class that provides AI-assisted testing capabilities for a given underlying testing framework.
 * @note Originally, this class is designed to work with Detox, but it can be extended to work with other frameworks.
 */
export class Pilot {
  // Singleton instance of Pilot
  static instance?: Pilot;

  private readonly stepPerformerPromptCreator: StepPerformerPromptCreator;
  private readonly apiSearchPromptCreator: APISearchPromptCreator;
  private readonly codeEvaluator: CodeEvaluator;
  private readonly snapshotManager: SnapshotManager;
  private previousSteps: PreviousStep[] = [];
  private stepPerformer: StepPerformer;
  private cacheHandler: StepPerformerCacheHandler;
  private isRunning: boolean = false;
  private autoPerformer: AutoPerformer;
  private autoPerformerPromptCreator: AutoPerformerPromptCreator;
  private screenCapturer: ScreenCapturer;

  private constructor(config: Config) {
    this.stepPerformerPromptCreator = new StepPerformerPromptCreator(config.frameworkDriver.apiCatalog);
    this.apiSearchPromptCreator = new APISearchPromptCreator(
      config.frameworkDriver.apiCatalog,
    );
    this.codeEvaluator = new CodeEvaluator();
    const snapshotComparator = new SnapshotComparator();
    this.snapshotManager = new SnapshotManager(
      config.frameworkDriver,
      snapshotComparator,
      downscaleImage,
    );
    this.autoPerformerPromptCreator = new AutoPerformerPromptCreator();
    this.cacheHandler = new StepPerformerCacheHandler();
    this.screenCapturer = new ScreenCapturer(
      this.snapshotManager,
      config.promptHandler,
    );
    this.stepPerformer = new StepPerformer(
      config.frameworkDriver.apiCatalog.context,
      this.stepPerformerPromptCreator,
      this.apiSearchPromptCreator,
      new ViewAnalysisPromptCreator(config.frameworkDriver.apiCatalog),
      this.codeEvaluator,
      config.promptHandler,
      this.cacheHandler,
      snapshotComparator,
      config.options?.cacheMode,
      config.options?.analysisMode,
    );
    this.autoPerformer = new AutoPerformer(
      this.autoPerformerPromptCreator,
      this.stepPerformer,
      config.promptHandler,
      this.screenCapturer,
    );
  }

  static isInitialized(): boolean {
    return !!Pilot.instance;
  }

  /**
   * Gets the singleton instance of Copilot.
   * @returns The Copilot instance.
   */
  static getInstance(): Pilot {
    if (!Pilot.instance) {
      throw new PilotError(
        "Copilot has not been initialized. Please call the `init()` method before using it.",
      );
    }

    return Pilot.instance;
  }

  /**
   * Initializes the Pilot with the provided configuration, must be called before using it.
   * @param config The configuration options for Pilot.
   */
  static init(config: Config): void {
    if (Pilot.instance) {
      throw new PilotError(
        "Copilot has already been initialized. Please call the `init()` method only once.",
      );
    }

    Pilot.instance = new Pilot(config);
  }

  /**
   * Performs a test step based on the given prompt.
   * @param step The step describing the operation to perform.
   */
  async performStep(step: string): Promise<any> {
    if (!this.isRunning) {
      throw new PilotError(
        "Copilot is not running. Please call the `start()` method before performing any steps.",
      );
    }
    const screenCapture: ScreenCapturerResult =
      await this.screenCapturer.capture();
    const { code, result } = await this.stepPerformer.perform(
      step,
      this.previousSteps,
      screenCapture,
    );
    this.didPerformStep(step, code, result);
    return result;
  }

  /**
   * Starts the Copilot by clearing the previous steps and temporary cache.
   * @note This must be called before starting a new test flow, in order to clean context from previous tests.
   */
  start(): void {
    if (this.isRunning) {
      throw new PilotError(
        "Copilot was already started. Please call the `end()` method before starting a new test flow.",
      );
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
      throw new PilotError(
        "Copilot is not running. Please call the `start()` method before ending the test flow.",
      );
    }

    this.isRunning = false;

    if (!isCacheDisabled) this.cacheHandler.flushTemporaryCache();
  }

  /**
   * Enriches the API catalog by adding the provided categories and JS context.
   * @param categories - The categories to register.
   * @param context - (Optional) Additional JS context to register.
   */
  extendAPICatalog(
    categories: TestingFrameworkAPICatalogCategory[],
    context?: any,
  ): void {
    this.stepPerformerPromptCreator.extendAPICategories(categories);
    if (context) this.stepPerformer.extendJSContext(context);
  }

  private didPerformStep(step: string, code: string, result: any): void {
    this.previousSteps = [
      ...this.previousSteps,
      {
        step,
        code,
        result,
      },
    ];
  }
  /**
   * Performs an entire test flow using the provided goal.
   * @param goal A string which describes the flow should be executed.
   * @returns pilot report with info about the actions thoughts ect ...
   */
  async autopilot(goal: string): Promise<AutoReport> {
    return await this.autoPerformer.perform(goal);
  }
}
