'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

describe('manifest.json', () => {
  it('declares the Chrome-supported manifest version', () => {
    expect(manifest.manifest_version).toBe(3);
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

  it('keeps package-lock metadata in sync with package.json', () => {
    expect(packageLock.version).toBe(pkg.version);
    expect(packageLock.packages[''].version).toBe(pkg.version);
    expect(packageLock.packages[''].engines).toEqual(pkg.engines);
  });

  it('references icon files that exist on disk', () => {
    expect(manifest.icons).toBeDefined();
    for (const iconPath of Object.values(manifest.icons)) {
      expect(exists(iconPath)).toBe(true);
    }
  });

  it('points the extension action at an existing popup and icon', () => {
    expect(manifest.browser_action).toBeUndefined();
    const action = manifest.action;
    expect(action).toBeDefined();
    if (action.default_popup) {
      expect(exists(action.default_popup)).toBe(true);
    }
    if (action.default_icon) {
      expect(exists(action.default_icon)).toBe(true);
    }
  });

  it('references background scripts that exist on disk', () => {
    const background = manifest.background || {};
    expect(background.scripts).toBeUndefined();
    expect(background.service_worker).toBeDefined();
    expect(exists(background.service_worker)).toBe(true);
  });

  it('uses MV3-compatible permissions and extension page CSP', () => {
    expect(manifest.permissions || []).not.toContain('<all_urls>');
    expect(manifest.host_permissions || []).toContain('<all_urls>');

    const extensionPagesCsp = manifest.content_security_policy.extension_pages;
    expect(extensionPagesCsp).toContain("script-src 'self'");
    expect(extensionPagesCsp).not.toContain("'unsafe-eval'");
  });

  it('references sandbox pages that exist on disk', () => {
    const pages = (manifest.sandbox && manifest.sandbox.pages) || [];
    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
      expect(exists(page)).toBe(true);
    }
    expect(manifest.sandbox.content_security_policy).toBeUndefined();
    expect(manifest.content_security_policy.sandbox).toContain('sandbox allow-scripts');
    expect(manifest.content_security_policy.sandbox).toContain("'unsafe-eval'");
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

  describe('localisation', () => {
    const localesDir = path.join(root, '_locales');
    const localeNames = fs
      .readdirSync(localesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    const readMessages = (locale) =>
      JSON.parse(fs.readFileSync(path.join(localesDir, locale, 'messages.json'), 'utf8'));

    it('ships at least 25 locales', () => {
      expect(localeNames.length).toBeGreaterThanOrEqual(25);
    });

    it('resolves the manifest __MSG_ references from the default locale', () => {
      const defaults = readMessages(manifest.default_locale);
      for (const field of ['name', 'description']) {
        const match = /^__MSG_(.+)__$/.exec(manifest[field]);
        if (match) {
          const key = match[1];
          expect(defaults[key]).toBeDefined();
          expect(typeof defaults[key].message).toBe('string');
          expect(defaults[key].message.length).toBeGreaterThan(0);
        }
      }
    });

    it('gives every locale a name and a Web Store-legal description (<=132 chars)', () => {
      for (const locale of localeNames) {
        const messages = readMessages(locale);
        expect(messages.appName && messages.appName.message).toBeTruthy();
        expect(messages.appDesc && messages.appDesc.message).toBeTruthy();
        expect(messages.appDesc.message.length).toBeLessThanOrEqual(132);
      }
    });
  });
});
