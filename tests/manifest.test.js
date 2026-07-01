'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

describe('manifest.json', () => {
  it('declares a supported manifest version', () => {
    expect([2, 3]).toContain(manifest.manifest_version);
  });

  it('has the required top-level metadata', () => {
    expect(typeof manifest.name).toBe('string');
    expect(manifest.name.length).toBeGreaterThan(0);
    expect(typeof manifest.description).toBe('string');
    expect(manifest.description.length).toBeGreaterThan(0);
    expect(typeof manifest.version).toBe('string');
    expect(manifest.version).toMatch(/^\d+\.\d+(\.\d+)?$/);
  });

  it('keeps the manifest and package versions in sync', () => {
    expect(manifest.version).toBe(pkg.version);
  });

  it('references icon files that exist on disk', () => {
    expect(manifest.icons).toBeDefined();
    for (const iconPath of Object.values(manifest.icons)) {
      expect(exists(iconPath)).toBe(true);
    }
  });

  it('points the browser action at an existing popup and icon', () => {
    const action = manifest.action || manifest.browser_action;
    expect(action).toBeDefined();
    if (action.default_popup) {
      expect(exists(action.default_popup)).toBe(true);
    }
    if (action.default_icon) {
      expect(exists(action.default_icon)).toBe(true);
    }
  });

  it('references background scripts that exist on disk', () => {
    const scripts = manifest.background && manifest.background.scripts;
    if (scripts) {
      for (const script of scripts) {
        expect(exists(script)).toBe(true);
      }
    }
  });

  it('references content scripts that exist on disk', () => {
    const contentScripts = manifest.content_scripts || [];
    for (const entry of contentScripts) {
      for (const script of entry.js || []) {
        expect(exists(script)).toBe(true);
      }
    }
  });

  it('declares a valid default locale directory', () => {
    if (manifest.default_locale) {
      expect(exists(path.join('_locales', manifest.default_locale, 'messages.json'))).toBe(true);
    }
  });
});
