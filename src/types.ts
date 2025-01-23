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
      context?: any
  ) => void;
}

/**
 * Driver interface for interacting with the underlying testing framework.
 */
export interface TestingFrameworkDriver {
  /**
   * Captures the current UI state as an image.
   * @returns Path to saved image, or undefined if imaging not supported
   */
  captureSnapshotImage: () => Promise<string | undefined>;

  /**
   * Captures the current UI component hierarchy.
   * @returns String representation of view hierarchy
   */
  captureViewHierarchyString: () => Promise<string>;

  /**
   * Available testing framework API methods.
   */
  apiCatalog: TestingFrameworkAPICatalog;
}

/**
 * Testing framework API catalog structure.
 */
export type TestingFrameworkAPICatalog = {
  /** Framework name (e.g., "Detox", "Jest") */
  name?: string;
  /** Framework purpose and capabilities */
  description?: string;
  /** Framework context variables */
  context: any;
  /** Available API method categories */
  categories: TestingFrameworkAPICatalogCategory[];
};

/**
 * Category of related testing framework API methods.
 */
export type TestingFrameworkAPICatalogCategory = {
  /** Category name */
  title: string;
  /** Methods in this category */
  items: TestingFrameworkAPICatalogItem[];
};

/**
 * Documentation for a testing framework API method.
 * @example
 * {
 *   signature: 'type(text: string)',
 *   description: 'Types text into target element',
 *   example: 'await element(by.id("username")).type("john_doe")',
 *   guidelines: ['Only works on text fields']
 * }
 */
export type TestingFrameworkAPICatalogItem = {
  /** Method signature */
  signature: string;
  /** Method description */
  description: string;
  /** Usage example */
  example: string;
  /** Optional usage guidelines */
  guidelines?: string[];
};

/**
 * Interface for handling AI service interactions.
 */
export interface PromptHandler {
  /**
   * Sends prompt to AI service and gets response.
   * @param prompt - Text prompt to send
   * @param image - Optional UI state image path
   */
  runPrompt: (prompt: string, image?: string) => Promise<string>;

  /**
   * Checks if AI service supports UI snapshots.
   */
  isSnapshotImageSupported: () => boolean;
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

/**
 * Executed test step record.
 */
export type PreviousStep = {
  /** Step description */
  step: string;
  /** Generated test code */
  code: string;
  /** Step execution result */
  result: any;
};

/**
 * Code evaluation output.
 */
export type CodeEvaluationResult = {
  /** Generated test code */
  code: string;
  /** Execution result */
  result: any;
  /** Context for next iteration */
  sharedContext?: Record<string, any>;
};

/** Review section types */
export type PilotReviewSectionType = "ux" | "a11y";

/** Complete pilot review */
export type PilotReview = {
  [key in PilotReviewSectionType]?: PilotReviewSection;
};

/**
 * Single pilot step execution report.
 */
export type PilotStepReport = {
  /** Action plan and reasoning */
  plan: PilotStepPlan;
  /** Optional reviews */
  review?: PilotReview;
  /** Generated code */
  code?: string;
};

/**
 * Complete pilot execution report.
 */
export type PilotReport = {
  /** Target objective */
  goal: string;
  /** Execution summary */
  summary?: string;
  /** Individual step reports */
  steps: PilotStepReport[];
  /** Final reviews */
  review?: PilotReview;
};

/**
 * Pilot step planning output.
 */
export type PilotStepPlan = {
  /** Planned action */
  action: string;
  /** Reasoning process */
  thoughts: string;
};

/**
 * Screen capture output.
 */
export type ScreenCapturerResult = {
  /** UI snapshot path */
  snapshot: string | undefined;
  /** Component hierarchy */
  viewHierarchy: string;
  /** Image capture support status */
  isSnapshotImageAttached: boolean;
};

/**
 * Review section content.
 */
export type PilotReviewSection = {
  /** Overall assessment */
  summary: string;
  /** Specific observations */
  findings?: string[];
  /** Numerical rating (1-10) */
  score: string;
};

/**
 * Previous pilot step record.
 */
export type PilotPreviousStep = {
  /** Step description */
  step: string;
  /** Optional reviews */
  review?: PilotReview;
};

/** Snapshot hashing algorithm types */
export type HashingAlgorithm = "BlockHash";

/** Hash algorithm output format */
export type SnapshotHashObject = Record<HashingAlgorithm, string>;

/**
 * Single cache entry.
 */
export type SingleCacheValue = {
  /** UI snapshot hash */
  snapshotHash?: SnapshotHashObject;
  /** Component hierarchy */
  viewHierarchy?: string;
  /** Generated code */
  code: string;
};

/** Cache entry array */
export type CacheValues = SingleCacheValue[];

/**
 * Snapshot hashing operations interface.
 */
export interface SnapshotHashing {
  /**
   * Generates hash from UI snapshot.
   * @param snapshot - UI snapshot to hash
   * @returns Hash string
   */
  hashSnapshot(snapshot: any): Promise<string>;

  /**
   * Calculates difference between snapshot hashes.
   * @param hash1 - First snapshot hash
   * @param hash2 - Second snapshot hash
   * @returns Numerical difference
   */
  calculateSnapshotDistance(hash1: string, hash2: string): number;

  /**
   * Checks if snapshots are similar enough.
   * @param hash1 - First snapshot hash
   * @param hash2 - Second snapshot hash
   * @param threshold - Optional similarity threshold
   * @returns true if similar, false otherwise
   */
  areSnapshotsSimilar(
      hash1: string,
      hash2: string,
      threshold?: number
  ): boolean;
}
