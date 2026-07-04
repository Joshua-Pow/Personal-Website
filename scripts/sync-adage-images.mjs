#!/usr/bin/env node

/**
 * Upload all adage hero images from adages-images/web/ to R2.
 * Invoked during deploy so Cloudflare Builds uploads with wrangler auth.
 *
 * Add new images as adages-images/web/<slug>.webp, then deploy.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const imagesDir = path.join(process.cwd(), "adages-images/web");

if (!fs.existsSync(imagesDir)) {
  process.exit(0);
}

const images = fs
  .readdirSync(imagesDir)
  .filter((file) => file.endsWith(".webp"))
  .sort();

if (images.length === 0) {
  process.exit(0);
}

for (const file of images) {
  const slug = path.basename(file, ".webp");
  const filePath = path.join(imagesDir, file);

  console.log(`\nSyncing adage image: ${slug}`);

  const result = spawnSync(
    "node",
    ["scripts/upload-adage-image.mjs", slug, filePath],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
