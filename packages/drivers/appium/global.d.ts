// global.d.ts
import type { Browser } from "@wdio/types";

declare global {
  // eslint-disable-next-line no-var
  var driver: Browser;
  const browser: Browser;
}

export {};
