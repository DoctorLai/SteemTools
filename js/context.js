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

// (Re)build the "SteemTools - Switch To" menu. Menus are created inside
// onInstalled so they register exactly once and persist across service-worker
// restarts (MV3 has no persistent background page).
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
  let url = tab.url;
  let domain = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
  if (domain) {
    domain = domain.toLowerCase();
    // only redirects when it is a steem domain
    if (steem_websites.includes(domain)) {
      if (domain != cur_domain) {
        url = url.replace(domain, cur_domain);
        chrome.tabs.update(tab.id, { url: url });
      }
    } else {
      // switch to
      chrome.tabs.update(tab.id, { url: 'https://' + cur_domain });
    }
  }
});
