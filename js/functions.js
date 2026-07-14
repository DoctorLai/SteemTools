'use strict';

// given a perm link restore its full Steem URL
const restore = (url) => {
  var pat = /(re-\w+-)*((\w+-)*)/g;
  var my = pat.exec(url);
  if (my[1] && my[2]) {
    var author = my[1].split('-')[1];
    var link = my[2].slice(0, -1);
    return 'https://steemit.com/@' + author + '/' + link;
  }
  return null;
};

// return if valid steem id
const validId = (id) => {
  id = id.trim();
  let pat = /^[a-z0-9\-.]+$/g;
  return id && pat.test(id);
};

// dots can't be used as a valid HTML div identifier
const getIdForDiv = (id) => {
  return id.replace(/\./g, '');
};

// try best to return a valid steem id
const prepareId = (id) => {
  if (id == undefined) {
    return '';
  }
  return id.replace('@', '').trim().toLowerCase();
};

// button click when press enter in text
const textPressEnterButtonClick = (text, button) => {
  text.keydown(function (e) {
    if (e.keyCode == 13) {
      button.click();
    }
  });
};

// get steem profile url given id
const getSteemUrl = (id) => {
  const value = String(id);
  const encoded = encodeURIComponent(value).replace(/'/g, '%27');
  return (
    "<a target=_blank rel='noopener noreferrer' href='https://steemit.com/@" +
    encoded +
    "'>@" +
    escapeHtml(value) +
    '</a>'
  );
};

// get chrome version
const getChromeVersion = () => {
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
};

// correct format of reputation with 3 decimal places
// PR not merged yet: https://github.com/steemit/steem-js/pull/345
const formatReputation = function (reputation, decimal_places = 3) {
  if (reputation == null) return reputation;
  let neg = reputation < 0;
  let rep = String(reputation);
  rep = neg ? rep.substring(1) : rep;
  let v = Math.log10((rep > 0 ? rep : -rep) - 10) - 9;
  v = neg ? -v : v;
  let vv = v * 9 + 25;
  return +(Math.round(vv + 'e+' + decimal_places) + 'e-' + decimal_places);
};

// get last week
const getLastWeek = () => {
  let today = new Date();
  let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  return lastWeek;
};

// read as text
const readResponseAsText = (response) => {
  return response.text();
};

// read as json
const readResponseAsJSON = (response) => {
  return response.json();
};

// check if valid response
const validateResponse = (response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
};

// escape html
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const safeExternalUrl = (value) => {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '#';
  } catch {
    return '#';
  }
};

// test if numbers
const isNumeric = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

// localStorage keys are namespaced with the app's short name to avoid clashing
// with anything else stored on the same origin.
const STORAGE_PREFIX = 'steemtools:';
const storageKey = (name) => STORAGE_PREFIX + name;

const readNamespacedStorage = (storage, name, legacyKey) => {
  const key = storageKey(name);
  let value = storage.getItem(key);
  if (value === null && legacyKey) {
    value = storage.getItem(legacyKey);
    if (value !== null) {
      storage.setItem(key, value);
      storage.removeItem(legacyKey);
    }
  }
  return value;
};

// build a human-readable version label, e.g. "2026-07-14 (054ffe1)" or
// "v1.1.0 · 2026-07-14 (054ffe1)" when a semantic version is provided. A missing
// or placeholder ("dev") commit is omitted.
const formatVersion = (info) => {
  info = info || {};
  const segments = [];
  if (info.version) {
    segments.push('v' + String(info.version).trim());
  }
  if (info.date) {
    segments.push(String(info.date).trim());
  }
  let label = segments.join(' · ');
  const commit = info.commit == null ? '' : String(info.commit).trim();
  if (commit && commit !== 'dev') {
    label = label ? label + ' (' + commit + ')' : '(' + commit + ')';
  }
  return label;
};

// Expose the pure helpers to Node-based tooling (e.g. Jest) without affecting the
// browser runtime, where `module` is undefined and this block is simply skipped.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
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
    safeExternalUrl,
    isNumeric,
    storageKey,
    readNamespacedStorage,
    formatVersion,
  };
}
