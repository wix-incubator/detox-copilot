---
id: implementing-custom-testing-framework-driver
title: Implementing Custom Testing Framework Driver
sidebar_label: Implementing Custom Testing Framework Driver
sidebar_position: 4
---
# Implementing a Custom Testing Framework Driver

The **testing framework driver** is a vital component of **Copilot by Detox** that enables integration with a chosen testing framework. It bridges Copilot's natural language capabilities with the framework's API, ensuring commands can be translated into executable actions. This guide provides detailed instructions on how to implement a custom testing framework driver and integrate it into the open-source project.

---

## Understanding the Role of a Framework Driver

Framework drivers define the matchers, actions, and behaviors that allow Copilot to interact with testing frameworks. By implementing a driver, you provide the necessary APIs for Copilot to execute commands in your framework.

The driver must conform to the `TestingFrameworkDriver` interface. For the full interface and an example implementation, see the [Framework Driver API page](../API/framework-driver.md).

---

## Steps to Add a Custom Framework Driver

### 1. **Understand the Interface**

All drivers must implement the `TestingFrameworkDriver` interface, which includes:
- `captureSnapshotImage(): Promise<string | undefined>`  
  Takes a snapshot of the current screen (optional, based on framework support).

- `captureViewHierarchyString(): Promise<string>`  
  Returns the view hierarchy of the current screen in a string format.

- `apiCatalog: TestingFrameworkAPICatalog`  
  A categorized catalog of actions, matchers, and utilities provided by the testing framework.

👉 Refer to the [Framework Driver API page](../API/framework-driver.md) for the detailed interface and a complete example.

---

### 2. **Set Up Your Driver**

- Place your custom driver file in the `src/drivers` directory.
- Follow naming conventions and structure for consistency with other drivers.
- Use the provided interface to guide your implementation.

---

### 3. **Define the API Catalog**

The `apiCatalog` organizes the testing framework's functionality into categories like **actions**, **matchers**, and **utilities**. For example:
- **Actions**: Commands like `tap`, `longPress`, and `scroll`.
- **Matchers**: Locators like `by.id` or `by.text`.
- **Utilities**: Framework-specific tools or helpers.

Ensure you include clear documentation, examples, and best practices for each method.

---

### 4. **Test Your Driver**

Testing is crucial for ensuring reliability. Validate your driver with:
- Unit tests for each method.
- Integration tests to confirm functionality with the target framework.
- Edge cases to handle unusual scenarios.

Place your tests alongside the driver in the appropriate test directory.

---

### 5. **Contribute Your Driver**

To share your driver with the community:
1. Fork the **Copilot by Detox** repository on GitHub.
2. Create a new branch for your driver:
   ```bash
   git checkout -b add-[framework-name]-driver
    ```
3. Add your driver under `src/drivers` and include tests.
4. Commit and push your changes:
   ```bash
    git add .
    git commit -m "Add framework driver for [framework-name]"
    git push origin add-[framework-name]-driver
    ```
5. Open a pull request in the repository.

For more details, check the [Contributing Guide](contributing-to-copilot-by-Detox.md).

---

## Additional Resources
 - [Framework Driver API](../API/framework-driver.md) – Full interface and examples.
 - [Integrating with Testing Frameworks](integrating-with-testing-frameworks.md) – Overview of framework drivers and their purpose.
 - [GitHub Issues Section](https://github.com/wix-incubator/detox-copilot/issues) – Explore tasks and ideas for new drivers.

---

By following this guide, you can implement and contribute a custom testing framework driver, expanding the versatility of Copilot by Detox and empowering the community to use it with new frameworks.
