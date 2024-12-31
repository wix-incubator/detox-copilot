# Supported Frameworks for Copilot

**Copilot by Detox** is designed to empower developers by simplifying the way they write tests for their applications. Originally developed as a feature for Detox, Copilot has grown into a **framework-agnostic tool**, making it adaptable to a wide range of testing frameworks with minimal customization.

---

## Detox Integration: Mobile Apps Testing

Detox, a powerful end-to-end testing framework for mobile apps, is the first framework to provide Copilot as part of its API. Copilot’s integration with Detox offers developers:

- **Natural language testing**: Write tests in plain, intuitive language instead of manual test scripting.
- **Enhanced usability with Detox APIs**: Leverage Detox’s robust matchers and actions, such as `by.id()`, `tap()`, and `longPress()`, for seamless app interaction.
- **Improved debugging tools**: Use snapshots, including screenshots and view hierarchies, to better analyze the app’s state during testing.

**To learn more, visit the ********[official documentation](https://wix.github.io/Detox/docs/copilot/testing-with-copilot)********.**

### Example: Writing Tests with Copilot in Detox

Here is an example test written in natural language that demonstrates step-by-step execution:

```js
it('should verify element sizes and button states', async () => {
  await copilot.perform(
    'Launch the app with notification permissions enabled',
    'Navigate to the "Settings" page',
    'Verify that the "Save" button is disabled',
    'Locate the profile picture element',
    'Verify that the profile picture size is 100 x 100 pixels and that the image is available and rendered',
    'Tap on the "Edit Profile" button',
    'Verify that the "Save" button is now enabled',
    'Verify that the "Username" field text is bold'
  );
});
```

---

## Expanding Copilot’s Reach: Call for Contributions

**Copilot by Detox** is built with a flexible, framework-agnostic design, enabling integration with various testing frameworks. Currently, Detox is the only framework providing the API and necessary framework driver for Copilot. However, we believe the potential for Copilot extends far beyond Detox.

We invite the community to contribute by:

- **Integrating new frameworks**: Extend Copilot’s compatibility to other testing frameworks by [developing the necessary drivers and APIs](https://github.com/wix-incubator/detox-copilot/issues).
- **Enhancing existing integrations**: Refine and optimize Copilot’s functionality within Detox or other supported frameworks.

Your contributions can help shape Copilot into a universal testing tool for developers worldwide. To get involved or learn more about potential integrations, visit our [GitHub repository](https://github.com/wix-incubator/detox-copilot/issues).
