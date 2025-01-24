import * as puppeteer from 'puppeteer';
import {setupBrowser} from '../setup/browserSetUp';
import {DetoxCopilot} from '../setup/copilotInit';
import {PromptHandler} from '../setup/promptHandler';

describe('Example Test Suite', () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;
  let copilot : DetoxCopilot;
  jest.setTimeout(30000); 

  beforeAll(async () => {
    const promptHandler : PromptHandler = new PromptHandler();
    copilot = new DetoxCopilot();
    copilot.init(promptHandler);
    copilot.start();
    const { browser: b, page: p } = await setupBrowser(false);
    browser = b;
    page = p;
  });

  afterAll(async () => {
    await browser.close();
    copilot.end();
  });

  it('perform test with pilot', async () => {
        await copilot.pilot('open https://www.n12.co.il/');
  });
});