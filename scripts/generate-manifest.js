#!/usr/bin/env node
/**
 * Regenerates data/manifest.json from the actual contents of
 * assets/images/ and assets/videos/.
 *
 * The live site tries the GitHub API first (works automatically, no
 * script needed) and only falls back to manifest.json if that API
 * call fails or gets rate-limited. Run this before you push if you
 * want that fallback to be reliable and up to date:
 *
 *   node scripts/generate-manifest.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];
const VIDEO_EXT = ['.mp4', '.webm', '.mov'];

function listFiles(dir, exts) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full)
    .filter(name => exts.includes(path.extname(name).toLowerCase()))
    .sort();
}

const manifest = {
  images: listFiles('assets/images', IMAGE_EXT),
  videos: listFiles('assets/videos', VIDEO_EXT),
};

fs.writeFileSync(
  path.join(ROOT, 'data/manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n'
);

console.log(`Manifest updated: ${manifest.images.length} images, ${manifest.videos.length} videos.`);
