---
id: basic-interface-overview
title: Basic Interface Overview
sidebar_label: Basic Interface Overview
sidebar_position: 1
---

# Basic Interface Overview

The Testing Copilot provides a simple yet powerful interface for controlling your test flows. This document covers the core API methods and configuration options.

## API Methods

### init()

```typescript
init(config: Config): void
```

Initializes the Copilot instance. Must be called before any other methods and only once in your test environment.

:::note
This must be called once before using any other Copilot methods, as it sets up the instance and configuration.
:::

Basic initialization example:
```typescript
import copilot from 'detox-copilot';
import { DetoxDriver } from 'your-testing-framework-driver'; // Replace with your actual driver
import { OpenAIHandler } from 'your-ai-service-handler'; // Replace with your actual handler

copilot.init({
  frameworkDriver: new DetoxDriver(),
  promptHandler: new OpenAIHandler({
    apiKey: process.env.OPENAI_API_KEY
  })
});
```

See [Configuration](#configuration) for more information on the `config` object.

### isInitialized()

```typescript
isInitialized(): boolean
```

Checks if the Copilot instance has been initialized.

```typescript
if (!copilot.isInitialized()) {
  // Initialize copilot
  copilot.init(config);
}
```

This is useful for ensuring that the Copilot is properly initialized before performing any actions.

### start()

```typescript
start(): void
```

Begins a new test flow, resetting previous steps and clearing temporary cache.

:::note
Must be called before performing any steps. If called while a flow is already active, it will throw an error.
:::

Starting a new test flow:
```typescript
copilot.start();
```

### perform()

```typescript
perform(...steps: string[]): Promise<string>
```

Executes one or more test steps using natural language. Returns the result of the last step.

:::note
Requires an active test flow (initiated by `start()`), otherwise it will throw an error.
:::

Single step example:
```typescript
// Perform a simple click action
const result = await copilot.perform("Click the login button");
```

Multiple steps example:
```typescript
// Execute multiple steps in sequence
const result = await copilot.perform(
  "Click the login button",
  "Type 'user@example.com' into the email field",
  "The login form should be visible"
);
```

### end()

```typescript
end(isCacheDisabled?: boolean): void
```

Concludes the test flow and optionally disables caching of the results.

Ending with default cache behavior:
```typescript
// Save results to cache (default behavior)
copilot.end();
```

Ending with cache disabled:
```typescript
// Skip saving to cache
copilot.end(true);
```

Ending with cache disabled is usually done when a test is failing and you want to ensure that the next test run is not affected by the previous test's results.

### extendAPICatalog()

```typescript
extendAPICatalog(categories: TestingFrameworkAPICatalogCategory[], context?: any): void
```

Extends the API catalog with additional testing framework capabilities.

```typescript
copilot.extendAPICatalog([
  {
    title: 'Deeplink Actions',
    items: [
      {
        signature: 'navigateToDeeplink(url: string)',
        description: 'Navigates to a given deeplink URL',
        example: 'await navigateToDeeplink("/home");',
        guidelines: [
         'This action should be used to navigate to a specific screen in the app.',
         'The URL should be a relative path, starting with a forward slash.'
        ]
      }
    ]
  }
]);
```

This is useful for adding custom actions to the Copilot's API catalog, which can be used in natural language prompts.

## Configuration

### Config Interface

The configuration interface defines how to set up Copilot with your testing framework and AI service:

```typescript
interface Config {
  frameworkDriver: TestingFrameworkDriver;
  promptHandler: PromptHandler;
  options?: CopilotOptions;
}

interface CopilotOptions {
  cacheMode?: 'full' | 'lightweight' | 'disabled';
}
```

#### Cache Modes

Cache mode is used to determine how the Copilot will cache the code generated for each step.
Default cache mode is `full`.

- **full**: Cache is used with the screen state (default)
- **lightweight**: Cache is used but only based on steps (without screen state)
- **disabled**: No caching is used

### Framework Drivers

:::note Available Drivers
The `frameworkDriver` supports various testing frameworks, see [Framework Drivers](/docs/API/framework-driver) for more information.
:::

Basic driver initialization:
```typescript
const driver = new DetoxDriver();
```

### Prompt Handlers

The `promptHandler` manages communication with AI services.

Setting up OpenAI as the AI service:
```typescript
const handler = new OpenAIHandler({
  apiKey: process.env.OPENAI_API_KEY
});
```

## API Basic Usage Notes

- Always call methods in sequence: `init` → `start` → `perform` → `end`
- Handle errors appropriately using try-catch blocks
- Clean up resources by calling `end()` after each test flow
- Use multiple steps in a single `perform` call for related actions

### Error Handling

The Copilot will throw a `CopilotError` when:
- Methods are called out of sequence
- A flow is started while another is active
- Steps are performed without an active flow (e.g. `perform` without `start`)
- Configuration is invalid or missing required fields

Complete flow with error handling:
```typescript
// Check initialization
if (!copilot.isInitialized()) {
   copilot.init(config);
}

// Start the flow
copilot.start();

try {
  // Perform steps, if any error occurs, the flow will be ended and the error will be thrown
  const result = await copilot.perform(
    "Click the login button",
    "Type 'test@example.com' into the email field",
    "The login form should be visible"
  );
} catch (error) {
   // Disable cache on error to avoid caching the failed flow
   copilot.end(true);
   throw error;
}

// End the flow (with default cache behavior)
copilot.end();
```
