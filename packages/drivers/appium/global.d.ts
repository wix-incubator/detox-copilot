// global.d.ts
import type { Browser } from "@wdio/types";

declare global {
  let driver: Browser;
  const browser: Browser;
}

export {};
