---
id: prompt-handler
title: Prompt Handler
sidebar_label: Prompt Handler
sidebar_position: 2
---

# Prompt Handler

In this section, we will cover how to implement a **Prompt Handler** to interact with AI services, such as OpenAI, in the context of **Copilot by Detox**.

## What is a Prompt Handler?

A **Prompt Handler** is responsible for sending a prompt to an AI service and receiving the response. It may also handle the inclusion of additional context, such as a snapshot image, to enhance the AI's understanding of the app's UI state. Implementing a prompt handler allows **Copilot** to generate intelligent test scripts based on natural language commands.

## How to Write a Prompt Handler

A **Prompt Handler** follows a defined interface, which ensures it can communicate with any AI service in a standardized way.

### PromptHandler Interface

The `PromptHandler` interface includes the following methods:

- **`runPrompt`**: Sends a prompt to the AI service and returns the generated response.
- **`isSnapshotImageSupported`**: Checks if the AI service supports snapshot images to provide additional context.

Here’s an example of the `PromptHandler` interface:

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

### Example: Implementing the Prompt Handler for Sonnet

```typescript
const axios = require('axios');
const fs = require('fs').promises;

class PromptHandler {
  // Upload an image to the AI service
  async uploadImage(imagePath) {
    const image = await fs.readFile(imagePath);

    try {
      const response = await axios.post('https://bo.wix.com/mobile-infra-ai-services/v1/image-upload', {
        image,
      });

      const imageUrl = response.data.url;
      if (!imageUrl) {
        throw new Error('Cannot find uploaded URL, got response:', response.data);
      }

      return imageUrl;
    } catch (error) {
      console.error('Error while uploading image:', error);
      throw error;
    }
  }

  // Run the prompt and return the generated text
  async runPrompt(prompt, image) {
    if (!image) {
      throw new Error('Image is required');
    }

    const imageUrl = await this.uploadImage(image);

    try {
      const response = await axios.post('https://bo.wix.com/mobile-infra-ai-services/v1/prompt', {
        prompt,
        model: 'SONNET_3_5',
        ownershipTag: 'Detox OSS',
        project: 'Detox OSS',
        images: [imageUrl]
      });

      const generatedText = response.data.generatedTexts[0];
      if (!generatedText) {
        throw new Error('Failed to generate text, got response:', response.data);
      }

      return generatedText;
    } catch (error) {
      console.error('Error running prompt:', error);
      throw error;
    }
  }

  // Check if snapshot images are supported
  isSnapshotImageSupported() {
    return true;
  }
}

module.exports = PromptHandler;
```

## Open Tasks For Contributors
If you're interested in contributing to Copilot by Detox and adding new prompt handlers or improving the existing ones, check out the open tasks on our [GitHub repository](https://github.com/wix-incubator/detox-copilot/issues).
