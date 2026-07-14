'use strict';

const {
  restore,
  validId,
  getIdForDiv,
  prepareId,
  textPressEnterButtonClick,
  getSteemUrl,
  getChromeVersion,
  formatReputation,
  getLastWeek,
  readResponseAsText,
  readResponseAsJSON,
  validateResponse,
  escapeHtml,
  isNumeric,
  storageKey,
  formatVersion,
} = require('../js/functions.js');

function setUserAgent(ua) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
}

describe('restore', () => {
  it('rebuilds a Steem URL from a re-comment permlink', () => {
    expect(restore('re-justyy-hello-world')).toBe('https://steemit.com/@justyy/hello');
  });

  it('returns null when the permlink cannot be parsed', () => {
    expect(restore('nomatch')).toBeNull();
    expect(restore('')).toBeNull();
  });
});

describe('validId', () => {
  it('accepts valid lowercase Steem ids', () => {
    expect(validId('justyy')).toBe(true);
    expect(validId('a.b-c')).toBe(true);
    expect(validId('  justyy  ')).toBe(true); // trims first
  });

  it('rejects empty or malformed ids', () => {
    expect(validId('')).toBeFalsy();
    expect(validId('UPPER')).toBe(false);
    expect(validId('has space')).toBe(false);
    expect(validId('bad*char')).toBe(false);
  });
});

describe('getIdForDiv', () => {
  it('removes every dot so the id is a safe selector', () => {
    expect(getIdForDiv('a.b.c')).toBe('abc');
    expect(getIdForDiv('justyy')).toBe('justyy');
  });
});

describe('prepareId', () => {
  it('normalises an id by stripping @, whitespace and case', () => {
    expect(prepareId('@JustYY ')).toBe('justyy');
    expect(prepareId('  @a.b ')).toBe('a.b');
  });

  it('returns an empty string for undefined', () => {
    expect(prepareId(undefined)).toBe('');
  });
});

describe('getSteemUrl', () => {
  it('builds an anchor pointing at the Steem profile', () => {
    const html = getSteemUrl('justyy');
    expect(html).toContain("href='https://steemit.com/@justyy'");
    expect(html).toContain('>@justyy</a>');
  });
});

describe('getChromeVersion', () => {
  afterEach(() => {
    setUserAgent('Mozilla/5.0 (jsdom)');
  });

  it('parses the major Chrome version from the user agent', () => {
    setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    expect(getChromeVersion()).toBe(120);
  });

  it('returns false for non-Chrome user agents', () => {
    setUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0');
    expect(getChromeVersion()).toBe(false);
  });
});

describe('formatReputation', () => {
  it('returns the input unchanged when it is null', () => {
    expect(formatReputation(null)).toBeNull();
  });

  it('converts a large positive raw reputation', () => {
    expect(formatReputation(1000000000000)).toBeCloseTo(52, 2);
  });

  it('handles negative raw reputation', () => {
    expect(formatReputation(-1000000000000)).toBeCloseTo(-2, 2);
  });
});

describe('getLastWeek', () => {
  it('returns a Date roughly seven days in the past', () => {
    const result = getLastWeek();
    expect(result).toBeInstanceOf(Date);
    const deltaDays = (Date.now() - result.getTime()) / (24 * 60 * 60 * 1000);
    expect(deltaDays).toBeGreaterThanOrEqual(7);
    expect(deltaDays).toBeLessThan(8);
  });
});

describe('response helpers', () => {
  it('readResponseAsText delegates to response.text()', () => {
    expect(readResponseAsText({ text: () => 'body' })).toBe('body');
  });

  it('readResponseAsJSON delegates to response.json()', () => {
    expect(readResponseAsJSON({ json: () => ({ a: 1 }) })).toEqual({ a: 1 });
  });

  it('validateResponse passes through an ok response', () => {
    const ok = { ok: true, statusText: 'OK' };
    expect(validateResponse(ok)).toBe(ok);
  });

  it('validateResponse throws on a non-ok response', () => {
    expect(() => validateResponse({ ok: false, statusText: 'Not Found' })).toThrow('Not Found');
  });
});

describe('escapeHtml', () => {
  it('escapes all HTML-sensitive characters', () => {
    expect(escapeHtml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#039;s&lt;/a&gt;'
    );
  });
});

describe('isNumeric', () => {
  it('recognises numeric values', () => {
    expect(isNumeric(5)).toBe(true);
    expect(isNumeric('5')).toBe(true);
    expect(isNumeric('0.5')).toBe(true);
  });

  it('rejects non-numeric values', () => {
    expect(isNumeric('abc')).toBe(false);
    expect(isNumeric(NaN)).toBe(false);
    expect(isNumeric(Infinity)).toBe(false);
  });
});

describe('textPressEnterButtonClick', () => {
  it('clicks the button when Enter is pressed', () => {
    let handler;
    const text = {
      keydown: (fn) => {
        handler = fn;
      },
    };
    const button = { click: jest.fn() };

    textPressEnterButtonClick(text, button);
    handler({ keyCode: 13 });
    expect(button.click).toHaveBeenCalledTimes(1);

    handler({ keyCode: 65 });
    expect(button.click).toHaveBeenCalledTimes(1);
  });
});

describe('storageKey', () => {
  it('namespaces keys with the app prefix', () => {
    expect(storageKey('active_tab')).toBe('steemtools:active_tab');
  });

  it('keeps an already-prefixed value distinct', () => {
    expect(storageKey('')).toBe('steemtools:');
    expect(storageKey('a')).not.toBe(storageKey('b'));
  });
});

describe('formatVersion', () => {
  it('formats a date and commit', () => {
    expect(formatVersion({ date: '2026-07-13', commit: '054ffe1' })).toBe('2026-07-13 (054ffe1)');
  });

  it('includes the semantic version when provided', () => {
    expect(formatVersion({ version: '1.1.0', date: '2026-07-14', commit: '054ffe1' })).toBe(
      'v1.1.0 · 2026-07-14 (054ffe1)'
    );
  });

  it('omits a missing or placeholder commit', () => {
    expect(formatVersion({ version: '1.1.0' })).toBe('v1.1.0');
    expect(formatVersion({ date: '2026-07-14', commit: 'dev' })).toBe('2026-07-14');
  });

  it('returns an empty string when nothing is known', () => {
    expect(formatVersion({})).toBe('');
    expect(formatVersion()).toBe('');
  });
});
