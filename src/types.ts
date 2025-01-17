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
 * @property context The available variables of the testing framework (i.e. exposes the matching function, expect, etc.).
 * @property categories The available categories of the testing framework API.
 */
export type TestingFrameworkAPICatalog = {
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
 * - 'disabled': No caching is used
 * - 'lightweight': Cache is used but only based on steps (without view hierarchy)
 * - 'full': Cache is used with view hierarchy (default)
 */
export type CacheMode = 'disabled' | 'lightweight' | 'full';

/**
 * Configuration options for the Copilot behavior.
 */
export interface CopilotOptions {
    /**
     * The cache mode to use.
     * @default 'full'
     */
    cacheMode?: CacheMode;
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
