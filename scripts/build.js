#!/usr/bin/env node
'use strict';

/**
 * Builds a Chrome Web Store-ready zip of the extension.
 *
 * Only the files required at runtime are bundled; development tooling, tests,
 * design sources and version-control metadata are excluded. The archive places
 * manifest.json at its root, as required by the Web Store.
 *
 * Usage: `npm run build`
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { generate } = require('./gen-version');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));
const distDir = path.join(root, 'dist');
const outFile = path.join(distDir, `steem-tools-v${pkg.version}.zip`);

// Standalone files shipped at the root of the package.
const FILES = ['manifest.json', 'main.html', 'sandbox.html', 'icon.png', 'LICENSE'];

// Directories shipped recursively, with per-directory ignore globs.
const DIRECTORIES = {
  _locales: [],
  bs: [],
  css: [],
  images: ['logo/**'], // design sources (.ai/.pdf) are not needed at runtime
  js: [],
};

function main() {
  // Embed fresh build metadata (js/version.js) into the package.
  generate();

  fs.mkdirSync(distDir, { recursive: true });
  if (fs.existsSync(outFile)) {
    fs.unlinkSync(outFile);
  }

  const output = fs.createWriteStream(outFile);
  const archive = createArchive('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    const kb = (archive.pointer() / 1024).toFixed(1);
    console.log(`Created ${path.relative(root, outFile)} (${kb} KB, ${archive.pointer()} bytes).`);
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn(err.message);
    } else {
      throw err;
    }
  });
  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  for (const file of FILES) {
    if (fs.existsSync(path.join(root, file))) {
      archive.file(path.join(root, file), { name: file });
    } else {
      console.warn(`Skipping missing file: ${file}`);
    }
  }

  for (const [dir, ignore] of Object.entries(DIRECTORIES)) {
    const full = path.join(root, dir);
    if (fs.existsSync(full)) {
      archive.glob('**/*', { cwd: full, dot: false, ignore }, { prefix: dir });
    } else {
      console.warn(`Skipping missing directory: ${dir}`);
    }
  }

  return archive.finalize();
}

function createArchive(format, options) {
  if (typeof archiver === 'function') {
    return archiver(format, options);
  }
  if (format === 'zip' && typeof archiver.ZipArchive === 'function') {
    return new archiver.ZipArchive(options);
  }
  if (format === 'tar' && typeof archiver.TarArchive === 'function') {
    return new archiver.TarArchive(options);
  }
  throw new TypeError('Unsupported archiver export shape');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
