import * as puppeteer from "puppeteer";

export async function setupBrowser(
  headless: boolean = false,
): Promise<{ browser: puppeteer.Browser; page: puppeteer.Page }> {
  const browser = await puppeteer.launch({
    headless: headless,
    slowMo: headless ? 0 : 50,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  return { browser, page };
}
