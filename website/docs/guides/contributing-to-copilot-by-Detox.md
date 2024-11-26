---
id: contributing-to-copilot-by-detox
title: Contributing to Copilot by Detox
sidebar_label: Contributing to Copilot
sidebar_position: 5
---

# Contributing to Copilot by Detox

**Copilot by Detox** thrives on community contributions, and we welcome developers to help improve its functionality, extend its compatibility, and refine its features. This guide outlines how you can contribute by adding **prompt handlers** and **framework drivers**, along with some Detox-specific practices to follow.

---

## Adding a Prompt Handler

Prompt handlers are responsible for interfacing with AI services, such as OpenAI, to send prompts and receive responses. To add a new prompt handler:

1. **Understand the Interface**:  
   The prompt handler must implement the `PromptHandler` interface located in `src/prompt-handlers`. This ensures consistent behavior across all handlers.  
   
    👉 *Get to the [Prompt Handler API page](../API/prompt-handler.md) to see the full interface and an example implementation.*
    
    Key methods include:
    - `runPrompt(prompt: string, image?: string): Promise<string>`
    - `isSnapshotImageSupported(): boolean`

2. **Create the Handler**:  
   Add your handler in the `src/prompt-handlers` directory, following the structure of existing handlers. For instance, ensure your handler supports features like image snapshots if applicable.

3. **Test Your Handler**:  
   Write unit tests to validate your implementation. Check existing test examples to align with the project’s testing practices.

For more details, explore the [issues section](https://github.com/wix-incubator/detox-copilot/issues?q=is%3Aopen+is%3Aissue+label%3A%22prompt+handler%22) for tasks related to prompt handlers.

---

## Adding a Framework Driver

Framework drivers provide Copilot with the ability to interact with testing frameworks. They are essential for maintaining Copilot’s framework-agnostic architecture. To add or improve a driver:

1. **Understand the Interface**:  
   Drivers must implement the `TestingFrameworkDriver` interface located in `src/drivers`.
   
    👉 *Check out the [Framework Driver API page](../API/framework-driver.md) for the full interface and a sample implementation.*
   
    Key methods include:
    - `captureSnapshotImage(): Promise<string | undefined>`
    - `captureViewHierarchyString(): Promise<string>`
    - `apiCatalog: TestingFrameworkAPICatalog`

2. **Follow General Practices**:
    - Place your driver code under `src/drivers`.
    - Ensure that your driver integrates well with the framework you are targeting.
    - Structure your driver in a way that is consistent with other drivers in the repository.

3. **Expand the API Catalog**:  
   Drivers should include an `apiCatalog` defining the testing framework’s methods, categorized into actions, matchers, and utilities.

4. **Test Your Driver**:  
   Add tests to validate the functionality of your driver, including edge cases and integration scenarios.

Explore the [issues section](https://github.com/wix-incubator/detox-copilot/issues?q=is%3Aopen+is%3Aissue+label%3A%22testing+framework+driver%22) for tasks related to framework drivers.

---

## Contribution Tips

- **Check Existing Code**:  
  Review existing prompt handlers and drivers in `src/prompt-handlers` and `src/drivers` to follow established patterns.

- **Stay Consistent**:  
  Use the project’s coding standards and practices to ensure a seamless development experience.

- **Open Issues for Discussion**:  
  If you’re unsure about the implementation of a feature, feel free to open an issue on GitHub to discuss your ideas.

---

## Ready to Get Started?

Visit our [GitHub repository](https://github.com/wix-incubator/detox-copilot/issues) to find open issues, suggest ideas, or submit pull requests. Your contributions are invaluable in making **Copilot by Detox** a versatile and powerful tool for developers everywhere.
