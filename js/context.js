'use strict';

// all supported steem domains
let steem_websites = [
  'steemit.com',
  'staging.busy.org',
  'busy.org',
  'steemd.com',
  'steemdb.com',
  'steemhunt.com',
  'mspsteem.com',
  'utopian.io',
];

// Each "switch to" child menu stores its target domain in the item id, so the
// single onClicked listener below can recover it (MV3 dropped per-item onclick).
const MENU_ITEM_PREFIX = 'steemtools-switch:';
const PARENT_MENU_ID = MENU_ITEM_PREFIX + 'parent';

// Given the current tab URL and a target steem domain, return the URL to
// navigate to, or null when no navigation is needed. Kept pure for unit testing.
const resolveSwitchTarget = (currentUrl, targetDomain, websites) => {
  if (!currentUrl || !targetDomain) {
    return null;
  }
  let domain = currentUrl.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
  if (!domain) {
    return null;
  }
  domain = domain.toLowerCase();
  if (websites.includes(domain)) {
    // already on a steem front-end: swap the domain in place unless unchanged
    return domain === targetDomain ? null : currentUrl.replace(domain, targetDomain);
  }
  // not on a steem front-end: jump to the target front-end's home page
  return 'https://' + targetDomain;
};

// (Re)build the "SteemTools - Switch To" menu. Menus are created inside
// onInstalled so they register exactly once and persist across service-worker
// restarts (MV3 has no persistent background page).
/* istanbul ignore next -- Chrome context-menu wiring, exercised only in the browser */
const buildContextMenus = () => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: PARENT_MENU_ID,
      title: 'SteemTools - Switch To',
      contexts: ['page', 'frame'],
    });
    for (let i = 0; i < steem_websites.length; ++i) {
      let cur_domain = steem_websites[i];
      chrome.contextMenus.create({
        id: MENU_ITEM_PREFIX + cur_domain,
        parentId: PARENT_MENU_ID,
        title: cur_domain,
        contexts: ['page', 'frame'],
      });
    }
  });
};

// Register the Chrome listeners only inside the service worker; when this file
// is imported by Node (unit tests) `chrome` is undefined and this is skipped.
/* istanbul ignore next -- Chrome listener registration, runs only in the service worker */
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.contextMenus) {
  chrome.runtime.onInstalled.addListener(buildContextMenus);

  // MV3 replaces the per-item onclick callback with a single onClicked listener.
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    let menuId = info.menuItemId;
    if (typeof menuId !== 'string' || !menuId.startsWith(MENU_ITEM_PREFIX)) {
      return;
    }
    let cur_domain = menuId.slice(MENU_ITEM_PREFIX.length);
    if (cur_domain === 'parent' || !tab || !tab.url) {
      return;
    }
    const target = resolveSwitchTarget(tab.url, cur_domain, steem_websites);
    if (target) {
      chrome.tabs.update(tab.id, { url: target });
    }
  });
}

// Expose the pure helper to Node-based tooling (e.g. Jest). In the service
// worker `module` is undefined and this block is simply skipped.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { resolveSwitchTarget };
}
