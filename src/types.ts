/**
 * Interface for interacting with the Copilot.
 */
export interface CopilotFacade {
    /**
     * Initializes the Copilot with the given configuration.
     * Must be called before any other Copilot methods.
     * @param config The configuration for the Copilot.
     * @note This method should only be called once.
     */
    init: (config: Config) => void;

    /**
     * Checks if the Copilot has been initialized.
     * @returns True if the Copilot has been initialized, false otherwise.
     */
    isInitialized: () => boolean;

    /**
     * Start the Copilot instance.
     * @note Must be called before each flow to ensure a clean state (the Copilot uses the operations history as part of
     * its context).
     */
    start: () => void;

    /**
     * Finalizes the flow and optionally saves temporary cache data to the main cache.
     * If `isCacheDisabled` is true, the temporary cache will not be saved. False is the default value.
     * @param isCacheDisabled
     * @note This must be called after the flow is complete.
     */
    end: (isCacheDisabled?: boolean) => void;

    /**
     * Performs a testing operation or series of testing operations in the app based on the given `steps`.
     * @returns The result of the last step, if any.
     * @example Tap on the login button
     * @example Scroll down to the 7th item in the Events list
     * @example The welcome message should be visible
     * @example The welcome message text should be "Hello, world!"
     * @example 'Tap on the login button', 'A login form should be visible'
     */
    perform: (...steps: string[]) => Promise<string>;


     /**
     * Preforms actions untill it reaches the goal.
     * @example login with user "testuser" and password "testpassword123"
     * @example enter the store of "my store" site and buy one of the products
     * @example achive 2 points in the shape matching game
     */
    pilot: (goal: string) => Promise<PilotReport>;

    /**
     * Extends the API catalog of the testing framework with additional APIs (categories and JS context).
     * @param context The variables of the testing framework (i.e. exposes the matching function, expect, etc.).
     * @param categories The categories to add to the API catalog.
     * @note This can be used to add custom categories and items to the API catalog.
     */
    extendAPICatalog: (categories: TestingFrameworkAPICatalogCategory[], context?: any,) => void;

}

/**
 * Interface for the testing driver that will be used to interact with the underlying testing framework.
 */
export interface TestingFrameworkDriver {
    /**
     * Takes a snapshot of the current screen and returns the path to the saved image.
     * If the driver does not support image, return undefined.
     */
    captureSnapshotImage: () => Promise<string | undefined>;

    /**
     * Returns the current view hierarchy in a string representation.
     */
    captureViewHierarchyString: () => Promise<string>;

    /**
     * The available API methods of the testing framework.
     */
    apiCatalog: TestingFrameworkAPICatalog;
}

/**
 * Represents the available API of the testing framework that can be used by Copilot.
 * @property name Optional name of the testing framework (e.g. "Detox", "Jest", etc.).
 * @property description Optional description of the testing framework's purpose and capabilities.
 * @property context The available variables of the testing framework (i.e. exposes the matching function, expect, etc.).
 * @property categories The available categories of the testing framework API.
 */
export type TestingFrameworkAPICatalog = {
    name?: string;
    description?: string;
    context: any;
    categories: TestingFrameworkAPICatalogCategory[];
}

/**
 * Represents a category of the API of the testing framework that can be used by Copilot.
 * @property title The title of the category.
 * @property items The items in the category.
 */
export type TestingFrameworkAPICatalogCategory = {
    title: string;
    items: TestingFrameworkAPICatalogItem[];
}

/**
 * Represents a method docs in the API of the testing framework that can be used by Copilot.
 * @property signature The method signature of the API.
 * @property description A description of the API.
 * @property example An example of how to use the API.
 * @property guidelines An optional list of related guidelines for the API.
 *
 * @example
 * {
 *    signature: 'type(text: string)',
 *    description: 'Types the given text into the target element.',
 *    example: 'await element(by.id("username")).type("john_doe");',
 *    guidelines: [
 *      'Typing can only be done on text field elements.',
 *      'If the target is not a text field, find the nearest parent or child that is a text field.'
 *    ]
 * };
 */
export type TestingFrameworkAPICatalogItem = {
    signature: string;
    description: string;
    example: string;
    guidelines?: string[];
}

/**
 * Interface for the prompt handler that will be used to interact with the AI service (e.g. OpenAI).
 */
export interface PromptHandler {
    /**
     * Sends a prompt to the AI service and returns the response.
     * @param prompt The prompt to send to the AI service.
     * @param image Optional path to the image to upload to the AI service that captures the current UI state.
     * @returns The response from the AI service.
     */
    runPrompt: (prompt: string, image?: string) => Promise<string>;

    /**
     * Checks if the AI service supports snapshot images for context.
     */
    isSnapshotImageSupported: () => boolean;
}

/**
 * The cache mode for the Copilot.
 *  - 'full': Cache is used with the screen state (default)
 *  - 'lightweight': Cache is used but only based on steps (without screen state)
 *  - 'disabled': No caching is used
 * @default 'full'
 */
export type CacheMode = 'full' | 'lightweight' | 'disabled';
/**
 * The analysis mode for the Copilot.
 *  - 'fast': Skip API search and view hierarchy analysis preprocessing (default)
 *  - 'full': Perform complete analysis including API search and view hierarchy preprocessing
 * @default 'fast'
 */
export type AnalysisMode = 'fast' | 'full';

/**
 * Configuration options for the Copilot behavior.
 */
export interface CopilotOptions {
    /**
     * The cache mode to use.
     * @default 'full'
     */
    cacheMode?: CacheMode;

    /**
     * The analysis mode to use.
     * @default 'fast'
     */
    analysisMode?: AnalysisMode;
}
/**
 * Configuration options for Copilot.
 * @property frameworkDriver The testing driver to use for interacting with the underlying testing framework.
 * @property promptHandler The prompt handler to use for interacting with the AI service
 * @property options Additional options for configuring Copilot behavior
 */
export interface Config {
    /**
     * The testing driver to use for interacting with the underlying testing framework.
     */
    frameworkDriver: TestingFrameworkDriver;

    /**
     * The prompt handler to use for interacting with the AI service
     */
    promptHandler: PromptHandler;

    /**
     * Additional options for configuring Copilot behavior
     */
    options?: CopilotOptions;
}

/**
 * Represents a previous step that was performed in the test flow.
 * @note This is used to keep track of the context and history of the test flow.
 * @property step The description of the step.
 * @property code The generated test code for the step.
 * @property result The result of the step.
 */
export type PreviousStep = {
    step: string;
    code: string;
    result: any;
}

/**
 * Represents the result of a code evaluation operation.
 * @property code The generated test code for the operation.
 * @property result The result of the operation.
 */
export type CodeEvaluationResult = {
    code: string;
    result: any;
}

/**
 * The different types of reviews pilot can perform
 */
export type PilotReviewSectionType = 'ux' | 'a11y';

/**
 * Represents the pilot's review object which contatins different review and other fields
 */
export type PilotReview = { [key in PilotReviewSectionType]?: PilotReviewSection; };

/**
 * Represents the output of each iteration of pilot's perform.
 * @property contains the action and thoughts that were taken by the LLM 
 * @property pilot's reviews for the different kind of reviews the user ask
 * @property the code that were created by the LLM from pilot's action
 */
export type PilotStepReport = {
    plan: PilotStepPlan;
    review?: PilotReview;
    code?: string;
}

/**
 * Represents the output of pilot.
 * @property the goal pilot should achieve 
 * @property summary of the given steps 
 * @property steps report of pilot's actions (thoughts, actions, code ....)
 * @property pilot's reviews for the different kind of reviews the user ask
 */
export type PilotReport = { 
    goal : string;
    summary ? : string;
    steps : PilotStepReport[];
    review?: PilotReview;
}

/**
 * Represents the output of pilots createStepPlan method.
 * @property report of pilot's actions (thoughts, actions, ect ....)
 */
export type PilotStepPlan = {
    action: string;
    thoughts: string;
}

/**
 * Represents the output of screen capturer createStepPlan method.
 * @property snapshot of the currnet screen or undeifned 
 * @property view hierarchy of the current screen
 * @property boolean indicating if snapshot is supported or not
 */
export type ScreenCapturerResult = {
    snapshot: string | undefined;
    viewHierarchy: string;
    isSnapshotImageAttached: boolean;
}

/**
 * Pilots review of the currnet screen
 * @property review of the current screen (accessability or ux)
 * @property findings of the current step
 * @property score from 1-10 about the ux or accessability of the current step
 */
export type PilotReviewSection = {
    summary: string;
    findings? : string[];
    score: string;
}

/**
 * Represents a previous step of pilot.
 * @property step The description of the step.
 * @property pilot's reviews for the different kind of reviews the user ask
 */
export type PilotPreviousStep = {
    step: string;
    review?: PilotReview;
}

/**
 * Represents the types of hashing algorithms that are used for snapshot hashing.
 */
export type HashingAlgorithm = "BlockHash";

/**
 * Hash generated by image hashing algorithm (i.e. HashingAlgorithm).
 */
export type SnapshotHashObject = Record<HashingAlgorithm, string>;

/**
 * Represents a single cache value for the Copilot cache.
 * if multiple values are stored in the cache for the same key, they are stored as an array of SingleCacheValue
 */
export type SingleCacheValue = {
    snapshotHash?: SnapshotHashObject;
    viewHierarchy?: string;
    code: string;
}

/**
 * Represents a single cache value for the Copilot cache.
 */
export type CacheValues = SingleCacheValue[];

/**
 * Represents a list of methods to implements different hashing algorithms.
 */
export interface SnapshotHashing {
    /**
     * Hashes the given snapshot.
     * @param snapshot The snapshot to hash.
     * @returns The hash of the snapshot.
     */
    hashSnapshot(snapshot: any): Promise<string>;

    /**
     * Calculates the distance between two snapshots.
     * @param hash1 The hash of the first snapshot.
     * @param hash2 The hash of the second snapshot.
     * @returns The distance between the two snapshots.
     */
    calculateSnapshotDistance(hash1: string, hash2: string): number;

    /**
     * Checks if two snapshots are similar based on a threshold.
     * @param hash1 The hash of the first snapshot.
     * @param hash2 The hash of the second snapshot.
     * @param threshold The threshold for similarity.
     * @returns True if the snapshots are similar, false otherwise.
     */
    areSnapshotsSimilar(hash1: string, hash2: string, threshold?: number): boolean;
}
