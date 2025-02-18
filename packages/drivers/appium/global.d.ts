import type { Browser } from "webdriverio";

declare global {
  const browser: Browser<"async">;
}

export {};
