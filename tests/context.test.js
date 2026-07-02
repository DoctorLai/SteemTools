'use strict';

const { resolveSwitchTarget } = require('../js/context.js');

const sites = ['steemit.com', 'busy.org', 'steemd.com', 'steemdb.com'];

describe('resolveSwitchTarget', () => {
  it('swaps the domain in place when on a steem front-end', () => {
    expect(resolveSwitchTarget('https://steemit.com/@justyy/post', 'busy.org', sites)).toBe(
      'https://busy.org/@justyy/post'
    );
  });

  it('preserves the scheme, path, query and hash', () => {
    expect(resolveSwitchTarget('http://steemd.com/a/b?x=1#y', 'steemit.com', sites)).toBe(
      'http://steemit.com/a/b?x=1#y'
    );
  });

  it('returns null when already on the target domain', () => {
    expect(resolveSwitchTarget('https://busy.org/@justyy', 'busy.org', sites)).toBeNull();
  });

  it('jumps to the target home page when not on a steem front-end', () => {
    expect(resolveSwitchTarget('https://www.google.com/search?q=steem', 'steemit.com', sites)).toBe(
      'https://steemit.com'
    );
  });

  it('returns null for empty or missing input', () => {
    expect(resolveSwitchTarget('', 'busy.org', sites)).toBeNull();
    expect(resolveSwitchTarget('https://steemit.com', '', sites)).toBeNull();
    expect(resolveSwitchTarget(undefined, 'busy.org', sites)).toBeNull();
  });

  it('returns null when the URL has no host (scheme only)', () => {
    expect(resolveSwitchTarget('https://', 'busy.org', sites)).toBeNull();
  });
});
