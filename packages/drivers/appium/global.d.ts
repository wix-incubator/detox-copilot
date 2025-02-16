// global.d.ts
import type { Browser } from '@wdio/types';

declare global {
  var driver: Browser;
  const browser: Browser;
}

export {};
