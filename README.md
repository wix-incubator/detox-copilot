# Detox Copilot

A flexible plugin that drives your tests with human-written commands, enhanced by the power of large language models (LLMs).
While originally designed for Detox, Detox Copilot can be extended to **any other testing frameworks**.

It provides clear APIs to perform actions and assertions within your tests while interfacing with an LLM service to enhance the testing process.

## API Overview

High-level overview of the API that Detox Copilot exposes, this is a **work in progress** and the final APIs may differ from this.

- `init(config)`: Initializes the Copilot with the provided configuration, must be called before using Copilot. The configuration includes the LLM service endpoint and the framework's driver.
- `reset()`: Resets the Copilot by clearing the previous steps. This is required to start a new test case with a clean context.
- `perform(steps)`: Performs a testing operation or series of testing operations in the app based on the given step intents (string or array of strings).
