# Use Cases for Copilot by Detox

**Copilot by Detox** is designed to empower developers by simplifying the way they write tests for their applications. The tool is inherently framework-agnostic, making it adaptable to a wide range of testing frameworks with minimal customization.

---

## Current Example: Detox Integration

Detox is a powerful end-to-end testing framework for mobile apps. Copilot can integrate with Detox to allow developers to:

- **Write tests in natural language**: Skip manual test scripting and focus on describing app behavior in clear, intuitive commands.
- **Leverage existing Detox APIs**: Seamlessly use matchers and actions like `by.id()`, `tap()`, and `longPress()` to interact with app elements.
- **Enhance debugging with snapshots**: Capture screenshots and view hierarchies to better understand the app's state during testing.

For example, a test to tap a login button and check for a success message can be as simple as:

```plain
Tap the "Login" button and verify that the success message appears.
```
This natural language prompt would be translated by Copilot into the following Detox code:
```js
await element(by.id('loginButton')).tap();
await expect(element(by.text('Success'))).toBeVisible();
```
By automating this translation, Copilot saves time, reduces the potential for errors, and lowers the barrier to entry for writing tests.

## Collaboration: Open for New Frameworks

**Copilot by Detox** is built with flexibility at its core, enabling seamless integration with a variety of testing frameworks. Its framework-agnostic design ensures that it can adapt to different testing environments without being tied to any single framework.

Detox is only one example of what’s possible. We encourage contributions to expand Copilot's capabilities and extend its compatibility to other frameworks. Whether you're adding support for a new framework or refining existing integrations, your input can help shape the future of Copilot.

To get involved or learn more about potential integrations, visit our [GitHub repository](https://github.com/wix-incubator/detox-copilot/issues).
