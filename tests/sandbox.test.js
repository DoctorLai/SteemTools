'use strict';

const { formatLogPart, formatLogArgs } = require('../js/sandbox.js');

describe('formatLogPart', () => {
  it('returns strings unchanged', () => {
    expect(formatLogPart('hello')).toBe('hello');
  });

  it('serialises plain objects as JSON', () => {
    expect(formatLogPart({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}');
  });

  it('serialises numbers and booleans', () => {
    expect(formatLogPart(42)).toBe('42');
    expect(formatLogPart(false)).toBe('false');
  });

  it('falls back to String() when JSON serialisation fails', () => {
    const circular = {};
    circular.self = circular;
    expect(formatLogPart(circular)).toBe('[object Object]');
  });
});

describe('formatLogArgs', () => {
  it('joins multiple arguments with a single space', () => {
    expect(formatLogArgs(['a', { b: 2 }, 3])).toBe('a {"b":2} 3');
  });

  it('returns an empty string for no arguments', () => {
    expect(formatLogArgs([])).toBe('');
  });
});
