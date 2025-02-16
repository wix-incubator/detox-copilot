// wdio.conf.ts
export const config = {
    runner: 'local',
    specs: ['./examples/**/*.test.ts'],
    maxInstances: 1,
  
    capabilities: [{
      platformName: 'iOS',
      deviceName: 'iPhone 14',
      automationName: 'XCUITest',
      app: './apps/YourApp.app',
    }],
  
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
  
    services: ['appium'],
    appium: {
      command: 'appium',
    },
  
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
      ui: 'bdd',
      timeout: 60000,
    },
  
    before: function () {
      global.driver = browser;
    },
  };
  