---
id: implementing-custom-testing-framework-driver
title: Implementing Custom Testing Framework Driver
sidebar_label: Implementing Custom Testing Framework Driver
sidebar_position: 4
---

# Implementing a Custom Testing Framework Driver

The **testing framework driver** is a core component of **Copilot by Detox**, enabling seamless integration with any testing framework. It allows Copilot to translate natural language commands into actionable steps using the framework's API. This guide outlines how to implement and integrate a custom testing framework driver into the Copilot ecosystem.

---

## Recommended Approach for Framework Support

Where possible, framework support should ideally be provided directly from the framework's codebase. For example, Detox includes support within its own repository: [Detox Copilot Driver](https://github.com/wix/Detox/tree/master/detox/src/copilot).

If this is not feasible, or for custom efforts, feel free to reach out via our [GitHub Issues Page](https://github.com/wix-incubator/detox-copilot/issues) to discuss integration ideas before development.

---

## Framework Integration

Copilot is designed to integrate with any testing framework. This flexibility allows developers to extend its capabilities by implementing custom drivers that align with the `TestingFrameworkDriver` interface.

To view supported frameworks, visit our [Supported Frameworks](../pages/supported-frameworks) page.

---

## Steps to Implement a Custom Framework Driver

### 1. **Understand the ****`TestingFrameworkDriver`**** Interface**

All drivers must implement the `TestingFrameworkDriver` interface. Key methods include:

- `captureSnapshotImage(): Promise<string | undefined>`\
  (Optional) Captures a snapshot of the current screen.

- `captureViewHierarchyString(): Promise<string>`\
  Returns the view hierarchy of the current screen as a string.

- `apiCatalog: TestingFrameworkAPICatalog`\
  Categorizes the framework’s actions, matchers, and utilities.

For detailed documentation, see the [Framework Driver API](../API/framework-driver.md).

### 2. **Develop Your Driver**

- Create your driver under the `src/drivers` directory.
- Follow naming conventions and maintain consistency with existing drivers.
- Implement the required interface methods.

### 3. **Define the API Catalog**

The `apiCatalog` organizes the framework’s capabilities into categories:

- **Actions**: e.g., `tap`, `longPress`, `scroll`.
- **Matchers**: e.g., `by.id`, `by.text`.
- **Utilities**: Framework-specific helpers.

Provide clear documentation and examples for each method to ensure ease of use.

### 4. **Contribute and Collaborate**

Share your driver with the community by proposing your idea on the [GitHub Issues Page](https://github.com/wix-incubator/detox-copilot/issues). Once aligned, contribute your work by adding your driver to the repository and providing relevant documentation.

---

## Additional Resources

- [Framework Driver API](../API/framework-driver.md): Detailed interface and example implementation.
- [Supported Frameworks](../pages/supported-frameworks): List of frameworks Copilot supports.
- [GitHub Issues](https://github.com/wix-incubator/detox-copilot/issues): Collaborate and discuss new drivers.
