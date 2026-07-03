#!/usr/bin/env node

/**
 * Upload an adage hero image to R2.
 *
 * One-time setup:
 *   npx wrangler r2 bucket create adages-images
 *
 * Usage:
 *   npm run adages:upload -- <slug> <path-to-image>
 *
 * Accepts .webp, .png, .jpg, or .jpeg. Non-WebP files are converted automatically
 * (max width 1280px, WebP quality 85) before upload.
 *
 * Examples:
 *   npm run adages:upload -- plant-a-tree ./exports/plant-a-tree.png
 *   npm run adages:upload -- plant-a-tree ./exports/plant-a-tree.webp --local
 *
 * Then create src/content/adages/<slug>.mdx with a matching slug in frontmatter.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const [, , slug, filePath, ...rest] = process.argv;
const useLocal = rest.includes("--local");
const slugPattern = /^[a-z0-9-]+$/;
const bucketName = "adages-images";
const maxBytes = 500 * 1024;
const supportedExtensions = new Set([".webp", ".png", ".jpg", ".jpeg"]);
const heroMaxWidth = 1280;
const webpQuality = 85;

function usage() {
  console.error(
    "Usage: npm run adages:upload -- <slug> <path-to-image>\n" +
      "       Supports .webp, .png, .jpg, .jpeg (PNG/JPG auto-converted to WebP)",
  );
  process.exit(1);
}

if (!slug || !filePath) {
  usage();
}

if (!slugPattern.test(slug)) {
  console.error(
    `Invalid slug "${slug}". Use lowercase letters, numbers, and hyphens only.`,
  );
  process.exit(1);
}

const resolvedPath = path.resolve(filePath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

const extension = path.extname(resolvedPath).toLowerCase();

if (!supportedExtensions.has(extension)) {
  console.error(
    `Unsupported file type "${extension}". Use .webp, .png, .jpg, or .jpeg.`,
  );
  process.exit(1);
}

async function prepareUploadFile() {
  if (extension === ".webp") {
    return { uploadPath: resolvedPath, cleanup: false };
  }

  const tempPath = path.join(
    os.tmpdir(),
    `adage-${slug}-${Date.now()}.webp`,
  );

  console.log(`Converting ${extension} → WebP (max width ${heroMaxWidth}px, quality ${webpQuality})...`);

  await sharp(resolvedPath)
    .resize({ width: heroMaxWidth, withoutEnlargement: true })
    .webp({ quality: webpQuality })
    .toFile(tempPath);

  const { size } = fs.statSync(tempPath);
  console.log(`Converted: ${Math.round(size / 1024)}KB → ${tempPath}`);

  return { uploadPath: tempPath, cleanup: true };
}

function warnIfLarge(fileToUpload) {
  const { size } = fs.statSync(fileToUpload);

  if (size > maxBytes) {
    console.warn(
      `Warning: file is ${Math.round(size / 1024)}KB. Target under 500KB for fast loads.`,
    );
  }
}

function uploadToR2(uploadPath) {
  const objectKey = `web/${slug}.webp`;

  const args = [
    "wrangler",
    "r2",
    "object",
    "put",
    `${bucketName}/${objectKey}`,
    `--file=${uploadPath}`,
    "--content-type=image/webp",
  ];

  if (!useLocal) {
    args.push("--remote");
  }

  const result = spawnSync("npx", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return objectKey;
}

const { uploadPath, cleanup } = await prepareUploadFile();

try {
  warnIfLarge(uploadPath);
  const objectKey = uploadToR2(uploadPath);

  console.log("");
  console.log(`Uploaded: ${objectKey}`);
  console.log(`Public path: /api/adages-images/${objectKey}`);
  console.log(
    `Next: create src/content/adages/${slug}.mdx with slug: ${slug} in frontmatter`,
  );
} finally {
  if (cleanup) {
    fs.unlinkSync(uploadPath);
  }
}
