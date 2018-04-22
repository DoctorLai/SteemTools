'use strict';

chrome.contextMenus.removeAll();

// all supported steem domains
let steem_websites = [
	"steemit.com",
	"busy.org",
	"steemd.com",
	"utopian.io"
];

// create parent context menu item
let parent = chrome.contextMenus.create({
	title: "SteemTools - Switch To",
	contexts: ['all']
});

// switch to click and sub menus
let sz = steem_websites.length;
for (let i = 0; i < sz; ++ i) {
	let cur_domain = steem_websites[i];
	let child = chrome.contextMenus.create({
		title: cur_domain, 
		parentId: parent, 
		onclick: (info, tab) => {
			let url = tab.url;
			let domain = url.replace('http://','').replace('https://','').split(/[/?#]/)[0];
			if (domain) {
				domain = domain.toLowerCase();
				// only redirects when it is steemit domain
				if (steem_websites.includes(domain)) {
					if (domain != cur_domain) {
						url = url.replace(domain, cur_domain);
						chrome.tabs.update(info.tab, {"url": url});
					}
				}
			}
		}	
	});	
}
