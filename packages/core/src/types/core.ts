import {
  TestingFrameworkDriver,
  TestingFrameworkAPICatalogCategory,
} from "@/types/framework";
import { PromptHandler } from "@/types/prompt";
import { PilotReport } from "@/types/pilot";

/**
 * Core interface for interacting with the Copilot testing automation system.
 */
export interface CopilotFacade {
  /**
   * Initializes the Copilot with the provided configuration.
   * Must be called once before using any other methods.
   * @param config - Configuration settings for the Copilot
   * @throws Error if called multiple times
   */
  init: (config: Config) => void;

  /**
   * Checks if Copilot has been properly initialized.
   * @returns true if initialized, false otherwise
   */
  isInitialized: () => boolean;

  /**
   * Starts a new test flow session.
   * Must be called before any test operations to ensure a clean state,
   * as Copilot uses operation history for context.
   */
  start: () => void;

  /**
   * Ends the current test flow session and handles cache management.
   * @param isCacheDisabled - If true, temporary cache data won't be persisted (default: false)
   */
  end: (isCacheDisabled?: boolean) => void;

  /**
   * Executes one or more test operations in sequence.
   * @param steps - Array of test step descriptions to perform
   * @returns Result of the final executed step
   * @example
   * // Single step
   * await perform('Tap on the login button')
   * // Multiple steps
   * await perform(
   *   'Scroll down to the 7th item',
   *   'The welcome message should be visible',
   *   'The welcome text should be "Hello"'
   * )
   */
  perform: (...steps: string[]) => Promise<string>;

  /**
   * Autonomously performs actions to achieve a specified testing goal.
   * @param goal - Description of the desired end state or objective
   * @returns Detailed report of actions taken and results
   * @example
   * await pilot('login with user "testuser" and password "pass123"')
   * await pilot('complete purchase flow in "my store"')
   */
  pilot: (goal: string) => Promise<PilotReport>;

  /**
   * Extends the testing framework's API capabilities.
   * @param categories - Additional API categories to add
   * @param context - Testing framework variables to expose
   */
  extendAPICatalog: (
    categories: TestingFrameworkAPICatalogCategory[],
    context?: any,
  ) => void;
}

/** Cache mode settings */
export type CacheMode = "full" | "lightweight" | "disabled";

/** Analysis mode settings */
export type AnalysisMode = "fast" | "full";

/**
 * Copilot behavior configuration options.
 */
export interface CopilotOptions {
  /** Cache mode (default: 'full') */
  cacheMode?: CacheMode;
  /** Analysis mode (default: 'fast') */
  analysisMode?: AnalysisMode;
}

/**
 * Complete Copilot configuration.
 */
export interface Config {
  /** Testing framework driver */
  frameworkDriver: TestingFrameworkDriver;
  /** AI service handler */
  promptHandler: PromptHandler;
  /** Optional behavior settings */
  options?: CopilotOptions;
}
