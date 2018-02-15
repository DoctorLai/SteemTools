'use strict';

// given a perm link restore its full Steem URL
const restore = (url) => {
    var pat = /(re-\w+-)*((\w+\-)*)/g;
    var my = pat.exec(url);
    if (my[1] && my[2]) {       
        var author = my[1].split('-')[1];
        var link = my[2].slice(0, -1);
        return 'https://steemit.com/@' + author + '/' + link;
    }
    return null;
}

// return if valid steem id
const validId = (id) => {
    id = id.trim();
    let pat = /^[a-z0-9\-\.]+$/g;
    return id && pat.test(id);
}

// dots can't be used as a valid HTML div identifier
const getIdForDiv = (id) => {
    return id.replace(".", "");
}

// try best to return a valid steem id
const prepareId = (id) => {
    if (id == undefined) {
        return "";
    }
    return id.replace("@", "").trim().toLowerCase();
}

// button click when press enter in text
const textPressEnterButtonClick = (text, button) => {
    text.keydown(function(e) {
        if (e.keyCode == 13) {
            button.click();
        }
    });        
}

// get steem profile url given id
const getSteemUrl = (id) => {
    return "<a target=_blank href='https://steemit.com/@" + id + "'>@" + id + "</a>";
}

// get chrome version
const getChromeVersion = () => {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : false;
}