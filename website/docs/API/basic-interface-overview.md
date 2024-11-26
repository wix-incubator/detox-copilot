---
id: basic-interface-overview
title: Basic Interface Overview
sidebar_label: Basic Interface Overview
sidebar_position: 1
---

# Basic Interface Overview
The Copilot class serves as the core of the testing process, allowing seamless interaction between natural language prompts and your testing framework. Below is an overview of its main lifecycle commands that help control the test flow:

## 1. `init(config: Config): void`
   The init method initializes the Copilot instance with the provided configuration. This must be called before using Copilot to ensure it is set up with the necessary framework drivers and prompt handlers.

```typescript
Copilot.init(config);
```

## 2. `start(): void`
   The start method begins a new test flow, resetting previous steps and clearing any temporary cache. It must be called before performing any steps in the test.

```typescript
copilot.start();
```
Note: Calling start after an active test flow has already been started will result in an error. Be sure to call end() before starting a new flow.

## 3. `performStep(step: string): Promise<any>`
   The performStep method allows Copilot to perform a test step based on a natural language prompt. The input step is parsed and evaluated by Copilot, interacting with the underlying framework to execute the corresponding action.

```typescript
const result = await copilot.performStep("Click the login button");
```
If Copilot is not running (i.e., start() has not been called), an error will be thrown.

## 4. `end(saveToCache: boolean = true): void`
   The end method concludes the test flow. It can optionally save temporary data to the main cache, ensuring any relevant information is retained for future tests.

```typescript
copilot.end(true); // Save to cache
```
Note: The end method should be called when the test flow is complete, and start() must be invoked again before starting a new test.

## Error Handling
If any method is called out of sequence, such as trying to perform steps without starting Copilot, or attempting to start Copilot while it is already running, the class will throw a CopilotError. This ensures that the test flow is controlled and prevents inconsistent states.
