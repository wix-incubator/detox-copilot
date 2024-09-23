# Detox Copilot

A flexible plugin that drives your tests with human-written commands, enhanced by the power of large language models (LLMs).
While originally designed for Detox, Detox Copilot can be extended to **any other testing frameworks**.

It provides clear APIs to perform actions and assertions within your tests while interfacing with an LLM service to enhance the testing process.

## Quick Demo

Here's an example of how Copilot runs over a Detox test case:

![detox-copilot-demo.gif](detox-copilot-demo.gif)

The test case is written in a human-readable format, and Copilot translates it into Detox actions on the fly.

**Not just Detox!** Copilot can be extended to any other testing frameworks.

## API Overview

High-level overview of the API that Detox Copilot exposes:

```typescript
/**
 * Initializes the Copilot with the given configuration.
 * Must be called before any other Copilot methods.
 * @param config The configuration for the Copilot.
 */
init: (config: Config) => void;

/**
 * Resets the Copilot instance.
 * Must be called before each test to ensure a clean state (the Copilot uses the operations history as part of
 * its context).
 */
reset: () => void;

/**
 * Performs a testing operation or series of testing operations in the app based on the given `steps`.
 * @returns The result of the operation(s), which can be a single value or an array of values for each step.
 * @example Tap on the login button
 * @example Scroll down to the 7th item in the Events list
 * @example The welcome message should be visible
 * @example The welcome message text should be "Hello, world!"
 * @example [
 *    'Tap on the login button',
 *    'A login form should be visible',
 * ]
 */
perform: (steps: string | string[]) => Promise<any | any[]>;
```

## Integration with Testing Frameworks

Detox Copilot requires two main components to work:

### **Prompt Handler**

An adapter that interfaces with the LLM service to generate actions based on the provided prompts. For example, GPT, Gemini, Sonnet or any other LLM service.

#### `PromptHandler` Interface

```typescript
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
```

### Testing Framework Driver

An adapter that interfaces with the testing framework to execute the generated actions. For example, Detox, Appium, Espresso, XCTest or any other testing framework.

In order for Copilot to work with the testing framework, the driver provides the API catalog and the JS context to execute the generated actions.

#### `TestingFrameworkDriver` Interface

```typescript
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
```
