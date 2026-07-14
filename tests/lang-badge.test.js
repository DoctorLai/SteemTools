'use strict';

const { percentage, color, badge } = require('../scripts/lang-badge.js');

describe('percentage', () => {
  it('computes a language share of the total bytes', () => {
    expect(percentage({ JavaScript: 90, HTML: 10 }, 'JavaScript')).toBe(90);
  });

  it('treats a missing language as zero', () => {
    expect(percentage({ HTML: 10 }, 'JavaScript')).toBe(0);
  });

  it('returns zero for an empty payload', () => {
    expect(percentage({}, 'JavaScript')).toBe(0);
  });
});

describe('color', () => {
  it('maps the percentage onto a shields colour', () => {
    expect(color(95)).toBe('brightgreen');
    expect(color(82.1)).toBe('green');
    expect(color(60)).toBe('yellowgreen');
    expect(color(40)).toBe('yellow');
    expect(color(10)).toBe('orange');
  });
});

describe('badge', () => {
  it('builds a shields.io endpoint payload', () => {
    expect(badge({ JavaScript: 91741, HTML: 16966, CSS: 2989 }, 'JavaScript')).toEqual({
      schemaVersion: 1,
      label: 'javascript',
      message: '82.1%',
      color: 'green',
    });
  });
});
