# Supported Frameworks for Wix Pilot

**Wix Pilot** enables natural language testing across different testing frameworks. Here's how to use it with our supported frameworks:

## Built-in Web Testing Support

### Playwright

```js
// 1. Install: npm install --save-dev @wix-pilot/playwright
// 2. Import and use:
import { PlaywrightFrameworkDriver } from '@wix-pilot/playwright';

it('should login', async () => {
  await pilot.perform(
    'Open "https://example.com" in the browser',
    'Fill in the username field with "testuser"',
    'Fill in the password field with "password123"',
    'Click the login button',
    'Verify that the dashboard is visible'
  );
});
```

Supports Chrome, Firefox, and WebKit with powerful auto-waiting mechanisms.

### Puppeteer

```js
// 1. Install: npm install --save-dev @wix-pilot/puppeteer
// 2. Import and use:
import { PuppeteerFrameworkDriver } from '@wix-pilot/puppeteer';

it('should submit a form', async () => {
  await pilot.perform(
    'Open "https://example.com/signup" in the browser',
    'Fill in the email field with "user@example.com"',
    'Check the terms checkbox',
    'Click submit',
    'Verify success message appears'
  );
});
```

Specialized for Chrome/Chromium automation with DevTools Protocol access.

## External Framework Support

### Detox

Available directly in the Detox package for mobile app testing. [See Detox documentation](https://wix.github.io/Detox/docs/pilot/testing-with-pilot).

```js
it('should update profile', async () => {
  await pilot.perform(
    'Launch the app',
    'Navigate to Settings',
    'Tap on "Edit Profile"',
    'Update username to "john_doe"',
    'Verify changes are saved'
  );
});
```

## Contributing

Want to add support for another framework? Check our [GitHub Issues](https://github.com/wix-incubator/pilot/issues) or submit a PR.
