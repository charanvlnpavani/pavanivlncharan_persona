import { existsSync } from "node:fs";
import puppeteer, { type Browser } from "puppeteer-core";
import { env } from "../../config/env";
import { logger } from "../../lib/logger";

/** Anything that can turn resume HTML into PDF bytes. Swappable in tests. */
export interface PdfRenderer {
  render(html: string): Promise<Buffer>;
  close?(): Promise<void>;
}

/**
 * Headless Chrome renderer. The PDF keeps real text (selectable, searchable,
 * ATS-readable). JavaScript and all network requests are disabled, so the
 * resume HTML can never fetch anything.
 */
class ChromePdfRenderer implements PdfRenderer {
  private browser: Promise<Browser> | null = null;

  private launch() {
    if (!env.CHROME_PATH || !existsSync(env.CHROME_PATH)) {
      throw new Error(`Chrome not found at CHROME_PATH="${env.CHROME_PATH}". Set CHROME_PATH in backend/.env.`);
    }
    const runningAsRoot = typeof process.getuid === "function" && process.getuid() === 0;
    return puppeteer.launch({
      executablePath: env.CHROME_PATH,
      headless: true,
      args: [
        "--disable-dev-shm-usage",
        "--font-render-hinting=none",
        // Containers often run as root, where Chrome's sandbox can't start.
        ...(runningAsRoot ? ["--no-sandbox"] : []),
      ],
    });
  }

  private async getBrowser() {
    if (this.browser) {
      const b = await this.browser.catch(() => null);
      if (b?.connected) return b;
    }
    this.browser = this.launch();
    const browser = await this.browser;
    browser.on("disconnected", () => {
      this.browser = null;
    });
    return browser;
  }

  async render(html: string) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setJavaScriptEnabled(false);
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        if (req.url().startsWith("data:")) void req.continue();
        else void req.abort();
      });
      await page.setContent(html, { waitUntil: "load", timeout: 30_000 });
      const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true, tagged: true, timeout: 60_000 });
      return Buffer.from(pdf);
    } finally {
      await page.close().catch(() => {});
    }
  }

  async close() {
    const b = await this.browser?.catch(() => null);
    this.browser = null;
    await b?.close().catch((err: unknown) => logger.warn({ err }, "Closing Chrome failed"));
  }
}

let renderer: PdfRenderer = new ChromePdfRenderer();

export const getPdfRenderer = () => renderer;
/** Tests use this to simulate a failing or fast renderer. */
export function setPdfRenderer(next: PdfRenderer) {
  renderer = next;
}
export const createChromeRenderer = () => new ChromePdfRenderer();
