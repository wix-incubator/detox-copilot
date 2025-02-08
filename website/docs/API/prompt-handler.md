---
id: prompt-handler
title: Prompt Handler
sidebar_label: Prompt Handler
sidebar_position: 2
---

# Prompt Handler

In this section, we will cover how to implement a **Prompt Handler** to interact with AI services, such as OpenAI, in the context of **Pilot**.

## What is a Prompt Handler?

A **Prompt Handler** is responsible for sending a prompt to an AI service and receiving the response. It may also handle the inclusion of additional context, such as a snapshot image, to enhance the AI's understanding of the app's UI state. Implementing a prompt handler allows **Pilot** to generate intelligent test scripts based on natural language commands.

## How to Write a Prompt Handler

A **Prompt Handler** follows a defined interface, which ensures it can communicate with any AI service in a standardized way.

### PromptHandler Interface

The `PromptHandler` interface includes the following methods:

- **`runPrompt`**: Sends a prompt to the AI service and returns the generated response.
- **`isSnapshotImageSupported`**: Checks if the AI service supports snapshot images to provide additional context.

Here's the `PromptHandler` interface:

```typescript
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
```

## Open Tasks For Contributors
If you're interested in contributing to Pilot and adding new prompt handlers or improving the existing ones, check out the open tasks on our [GitHub repository](https://github.com/wix-incubator/pilot/issues).

For more information or to suggest improvements, please visit our [GitHub repository](https://github.com/wix-incubator/pilot/issues).
