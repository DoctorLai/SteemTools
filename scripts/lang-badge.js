#!/usr/bin/env node
'use strict';

/**
 * Reads a GitHub "languages" API payload (bytes per language) from stdin and
 * writes a shields.io endpoint badge for the JavaScript percentage to
 * `.github/badges/javascript.json`. Used by `.github/workflows/language-badge.yml`
 * so the JavaScript-percentage badge in the README stays up to date automatically.
 *
 * Usage: gh api repos/OWNER/REPO/languages | node scripts/lang-badge.js
 */

const fs = require('fs');
const path = require('path');

function percentage(languages, language) {
  const total = Object.values(languages).reduce((sum, n) => sum + n, 0);
  if (!total) {
    return 0;
  }
  return ((languages[language] || 0) / total) * 100;
}

function color(pct) {
  if (pct >= 90) return 'brightgreen';
  if (pct >= 70) return 'green';
  if (pct >= 50) return 'yellowgreen';
  if (pct >= 30) return 'yellow';
  return 'orange';
}

function badge(languages, language) {
  const pct = percentage(languages, language);
  return {
    schemaVersion: 1,
    label: language.toLowerCase(),
    message: pct.toFixed(1) + '%',
    color: color(pct),
  };
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
  });
}

async function main() {
  const raw = (await readStdin()).trim();
  const languages = raw ? JSON.parse(raw) : {};
  const result = badge(languages, 'JavaScript');
  const outDir = path.resolve(__dirname, '..', '.github', 'badges');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'javascript.json');
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
  console.log('Wrote ' + path.relative(path.resolve(__dirname, '..'), outFile));
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { percentage, color, badge };
