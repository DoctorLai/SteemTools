'use strict';

console.log('SteemTools Content Script Loaded.');

// all supported steem domains
let steem_websites = ['steemit.com'];

// check if url is steem websites
const is_steem_domain = (url) => {
  if (!url) {
    return false;
  }
  try {
    const hostname = new URL(url.trim()).hostname.toLowerCase();
    return steem_websites.some((domain) => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
};

// return a steem profile url
const get_steem_url = (id) => {
  const value = String(id);
  const encoded = encodeURIComponent(value).replace(/'/g, '%27');
  const escaped = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return "<a href='https://steemit.com/@" + encoded + "'>@" + escaped + '</a>';
};

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}

function json(response) {
  return response.json();
}

let url = document.location.href;
/* istanbul ignore next -- DOM + network integration, exercised only in the browser */
if (is_steem_domain(url)) {
  let pat = /https?:\/\/(.*)\/@(.*)\/(.*)/g.exec(url);
  if (pat && pat[2] && pat[3]) {
    let id = pat[2];
    let permlink = pat[3];
    if (id && permlink) {
      let api =
        'https://api.justyy.workers.dev/api/steemit/simple-reblog/?cached&id=' +
        encodeURIComponent(id) +
        '&permlink=' +
        encodeURIComponent(permlink);
      console.log(api);
      fetch(api)
        .then(status)
        .then(json)
        .then(function (result) {
          let count = result.length;
          if (count > 0) {
            let h1 = document.querySelector('h1');
            let elem = document.createElement('div');
            let s = `<B>${count}</B> Resteems: `;
            for (let i = 0; i < count; ++i) {
              s += get_steem_url(result[i]['account']) + ' ';
            }
            elem.innerHTML = s;
            h1.after(elem);
          } else {
            let h1 = document.querySelector('h1');
            let elem = document.createElement('div');
            let s = '<i>No Resteems Yet.</i>';
            elem.innerHTML = s;
            h1.after(elem);
          }
        })
        .catch(function (error) {
          console.log('Request failed', error);
        });
    }
  }
}

/*
// Feature Removed.
document.body.onkeydown = function (e) {
    if (e && (e.key.toLowerCase() == "w") && e.altKey) {    	
    	var url = document.location.href;
		if (url.includes("steemit.com")) {
    		document.location.href = url.replace("steemit.com", "busy.org");
    	} else if (url.includes("staging.busy.org")) {
    		document.location.href = url.replace("staging.busy.org", "steemit.com");
    	} else if (url.includes("busy.org")) {
    		document.location.href = url.replace("busy.org", "steemit.com");
    	}
    }
};
*/

// Expose the pure helpers to Node-based tooling (e.g. Jest) without affecting the
// content script at runtime, where `module` is undefined and this block is skipped.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { is_steem_domain, get_steem_url, status, json };
}
