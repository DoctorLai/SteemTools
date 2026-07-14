'use strict';

// Exercises js/chrome-shim.js, the chrome.* stand-in used when the popup is opened
// as a plain web page (the GitHub Pages preview) rather than as an extension.

describe('chrome shim (GitHub Pages preview)', () => {
  beforeEach(() => {
    delete window.chrome;
    window.localStorage.clear();
    window.__STEEMTOOLS_VERSION__ = { version: '9.9.9' };
    jest.resetModules();
    require('../js/chrome-shim.js');
  });

  it('reports the build version through runtime.getManifest', () => {
    expect(window.chrome.runtime.getManifest()).toEqual({
      name: 'Steem Tools',
      version: '9.9.9',
    });
  });

  it('round-trips values through storage.sync backed by localStorage', (done) => {
    window.chrome.storage.sync.set({ steemtools: { a: 1 } }, () => {
      window.chrome.storage.sync.get('steemtools', (data) => {
        expect(data.steemtools).toEqual({ a: 1 });
        done();
      });
    });
  });

  it('namespaces storage keys under the app prefix', () => {
    window.chrome.storage.sync.set({ k: 'v' });
    expect(window.localStorage.getItem('steemtools:sync:k')).toBe('"v"');
  });

  it('returns an empty object for unknown keys', (done) => {
    window.chrome.storage.sync.get('missing', (data) => {
      expect(data).toEqual({});
      done();
    });
  });

  it('does nothing when already running as a real extension', () => {
    delete window.chrome;
    window.chrome = { runtime: { id: 'abc' } };
    jest.resetModules();
    require('../js/chrome-shim.js');
    expect(window.chrome.storage).toBeUndefined();
  });
});
