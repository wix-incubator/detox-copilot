import * as puppeteer from 'puppeteer';
import {setupBrowser} from '../setup/browserSetup';
import copilot from '@copilot';
import {PromptHandler} from '../../utils/promptHandler';
import {PuppeteerPageApi} from '@copilot/drivers/puppeteer/index';

describe('Example Test Suite', () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;
  jest.setTimeout(300000); 

  beforeAll(async () => {
    const promptHandler : PromptHandler = new PromptHandler();
    const { browser: b, page: p } = await setupBrowser(false);
    const safeContext = {
        evaluate: p.evaluate.bind(p),
        $: p.$.bind(p),
        $$: p.$$.bind(p),
        content: p.content.bind(p),
        screenshot: p.screenshot.bind(p),
        hover: p.hover.bind(p),
        page : p,
      };
    copilot.init({ promptHandler, frameworkDriver : PuppeteerPageApi(safeContext) });
    copilot.start();
    browser = b;
    page = p;
  });

  afterAll(async () => {
    await browser.close();
    copilot.end();
  });

  it('perform test with pilot', async () => {
        await copilot.pilot('open https://example.com/ and press on more information');
  });
});
