#!/usr/bin/env node
/**
 * Records a mobile viewport demo of the home page stagger animation.
 * Output: /opt/cursor/artifacts/home-stagger-demo.webm
 */
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ARTIFACTS_DIR = "/opt/cursor/artifacts";
const OUTPUT = path.join(ARTIFACTS_DIR, "home-stagger-demo.webm");
const URL = process.env.DEMO_URL ?? "http://127.0.0.1:3000";

async function main() {
  await mkdir(ARTIFACTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    reducedMotion: "no-preference",
    recordVideo: {
      dir: ARTIFACTS_DIR,
      size: { width: 390, height: 844 },
    },
  });

  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4500);

  const video = page.video();
  const recordedPath = video ? await video.path() : null;

  await context.close();
  await browser.close();

  if (recordedPath) {
    const { rename } = await import("node:fs/promises");
    await rename(recordedPath, OUTPUT);
    console.log(`Saved demo video to ${OUTPUT}`);
  } else {
    console.error("No video recorded");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
