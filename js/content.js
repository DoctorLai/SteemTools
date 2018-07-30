'use strict';

console.log("SteemTools Content Script Loaded.");

// all supported steem domains
let steem_websites = [
	"steemit.com",
	"staging.busy.org",
	"busy.org",
	"steemd.com",
	"steemdb.com",
	"steemhunt.com",
	"mspsteem.com",
	"utopian.io"
];

// check if url is steem websites
const is_steem_domain = (url) => {
	let x = steem_websites.length;
	if (!url) {
		return false;
	}
	url = url.trim().toLowerCase();
	for (let i = 0; i < x; ++ i) {
		let cur = steem_websites[i];
		if (url.includes(cur)) {
			return true;
		}
	}
	return false;
}

// return a steem profile url
const get_steem_url = (id) => {
	return "<a href='https://steemit.com/@" + id + "'>@" + id + "</a>";
}

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
if (is_steem_domain(url)) {
	let pat = /https?:\/\/(.*)\/@(.*)\/(.*)/g.exec(url);
	if (pat[2] && pat[3]) {
		let id = pat[2];
		let permlink = pat[3];
		if (id && permlink) {
			let api = "https://uploadbeta.com/api/steemit/simple-reblog/?cached&id=" + id + "&permlink=" + permlink;
			console.log(api);
			fetch(api)
			.then(status)
		  	.then(json)
		  	.then(function(result) {
        		let count = result.length;
        		if (count > 0) {
					let h1 = document.querySelector("h1");
					let elem = document.createElement("div");
					let s = `<B>${count}</B> Resteems: `;
					for (let i = 0; i < count; ++ i) {
						s += get_steem_url(result[i]['account']) + " ";
					}
					elem.innerHTML = s;
					h1.after(elem);	    
				} else {
					let h1 = document.querySelector("h1");
					let elem = document.createElement("div");
					let s = '<i>No Resteems Yet.</i>';
					elem.innerHTML = s;
					h1.after(elem);	    						
				}
		  	}).catch(function(error) {
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