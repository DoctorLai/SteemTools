'use strict';

const { is_steem_domain, get_steem_url, status, json } = require('../js/content.js');

describe('is_steem_domain', () => {
  it('matches supported Steem front-ends', () => {
    expect(is_steem_domain('https://steemit.com/@justyy')).toBe(true);
    expect(is_steem_domain('https://www.steemit.com/@justyy')).toBe(true);
  });

  it('rejects unrelated or empty URLs', () => {
    expect(is_steem_domain('https://www.google.com')).toBe(false);
    expect(is_steem_domain('https://steemit.com.evil.example/@justyy/post')).toBe(false);
    expect(is_steem_domain('not a URL')).toBe(false);
    expect(is_steem_domain('')).toBe(false);
    expect(is_steem_domain(undefined)).toBe(false);
    expect(is_steem_domain(null)).toBe(false);
  });
});

describe('get_steem_url', () => {
  it('builds an anchor pointing at the Steem profile', () => {
    expect(get_steem_url('justyy')).toBe("<a href='https://steemit.com/@justyy'>@justyy</a>");
  });

  it('encodes the URL and escapes the visible account id', () => {
    const html = get_steem_url("bad' onclick='alert(1)");
    expect(html).toContain('bad%27%20onclick%3D%27alert(1)');
    expect(html).toContain('@bad&#039; onclick=&#039;alert(1)</a>');
    expect(html).not.toContain(" onclick='");
  });
});

describe('status', () => {
  it('resolves for 2xx responses', async () => {
    const res = { status: 200 };
    await expect(status(res)).resolves.toBe(res);
  });

  it('rejects for non-2xx responses', async () => {
    await expect(status({ status: 500, statusText: 'Server Error' })).rejects.toThrow(
      'Server Error'
    );
  });
});

describe('json', () => {
  it('delegates to response.json()', () => {
    expect(json({ json: () => ({ ok: true }) })).toEqual({ ok: true });
  });
});
