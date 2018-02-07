'use strict';

// default api node
const default_node = 'https://api.steemit.com';

const validId = (id) => {
    id = id.trim();
    let pat = /^[a-z0-9\-\.]+$/g;
    return id && pat.test(id);
}

const getServer = () => {
    let server = $('select#server').val();
    return server;
}

// get steem profile url given id
const getSteemUrl = (id) => {
    return "<a target=_blank href='https://steemit.com/@" + id + "'>@" + id + "</a>";
}

const getChromeVersion = () => {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : false;
}

const logit = (msg) => {
    let d = new Date();
    let n = d.toLocaleTimeString();
    let dom = $('textarea#about');
    let s = dom.val();
    dom.val(s + "\n" + n + ": " + msg);
}

function getVP(id, dom, server) {
    let api = 'https://' + server + '/api/steemit/account/vp/?id=' + id;
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            dom.html("<i>@" + id + "'s Voting Power is</i> <B>" + result + "%</B>");
            if (result < 30) {
                dom.css("background-color", "red");
            } else if (result < 60) {
                dom.css("background-color", "orange");
            } else {
                dom.css("background-color", "green");
            }
            dom.css("color", "white");
            dom.css("width", result + "%");
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: VP + " + server + ': ' + id);
        }             
    });    
}

function getCuration(id, dom, server) {
    let api = 'https://' + server + '/api/steemit/account/curation/?cached&id=' + id;
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let c_24 = result['24hr'].toFixed(2);
            let c_7 = result['7d'].toFixed(2);
            let c_avg = result['avg'].toFixed(2);
            let s = '';
            s += '<h4>Curation Stats</h4>';
            s += '<ul>';
            s += '<li><B>24 Hours: </B>' + c_24 + " STEEM</li>";
            s += '<li><B>7 Days: </B>' + c_7 + " STEEM</li>";
            s += '<li><B>Average: </B>' + c_avg + " STEEM</li>";
            s += '</ul>';
            dom.html(s);
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: Curation + " + server + ': ' + id);
        }             
    });    
}

const getRep = (id, dom, server) => {
    server = server || default_node;
    steem.api.setOptions({ url: server });

    steem.api.getAccounts([id], function(err, result) {
        dom.html("<i>@" + id + "'s Reputation is</i> <B>" + steem.formatter.reputation(result[0]['reputation']) + "</B>");
    });    
}

function getServerInfo(server, dom) {
    let api = 'https://' + server + '/api/steemit/blocknumber/steemsql';
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = "<ul>";
            s += "<li><B>Server: </B>" + server + "</li>";
            s += "<li><B>Block Number: </B>" + result['block_num'] + "</li>";
            s += "<li><B>Timestamp: </B>" + result['timestamp'] + "</li>";
            s += "</ul>";
            dom.html(s);
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: getServerInfo: " + server);
        }             
    });    
}

function getNodeInfo(server, dom) {
    let api = server;
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = "<ul>";
            s += "<li><B>Node: </B>" + server + "</li>";
            s += "<li><B>Status: </B>" + result['status'] + "</li>";
            s += "<li><B>Timestamp: </B>" + result['datetime'] + "</li>";
            s += "<li><B>Commit: </B>" + result['source_commit'] + "</li>";
            s += "<li><B>Docker: </B>" + result['docker_tag'] + "</li>";
            s += "</ul>";
            dom.html(s);
        },
        error: function(request, status, error) {
            logit('Response: ' + request.responseText);
            logit('Error: ' + error );
            logit('Status: ' + status);
        },
        complete: function(data) {
            logit("API Finished: getNodeInfo: " + server);
        }             
    });    
}

document.addEventListener('DOMContentLoaded', function() {
    // init tabs
    $(function() {
        $( "#tabs" ).tabs();
    });
    // load steem id
    chrome.storage.sync.get('steemtools', function(data) {
        if (data && data.steemtools) {
            let settings = data.steemtools;
            if (settings["steemit_id"]) {
                let id = settings["steemit_id"].trim();
                $('input#steemit_id').val(id);  
                if (validId(id)) {
                    $('input#contributor_id').val(id);  
                    getVP(id, $("div#account_vp"), settings['server']);
                    getRep(id, $("div#account_rep"), settings['nodes']);
                    $('input#delegator').val(id);
                    $('a#profile').html("@" + id);
                    $('h4#profile_id').html("@" + id);
                    getCuration(id, $("div#profile_data"), settings['server']);
                }
            }
            if (settings["friends"]) {
                let friends = settings["friends"].trim();
                $('textarea#friends').val(friends);
                friends = friends.split("\n");
                let len = friends.length;
                for (let i = 0; i < len; ++ i) {
                    let id = friends[i];
                    if (validId(id)) {
                        $("div#friends_vp_rep").append("<div id='account_vp_100_" + id + "' class='vpbar'><div id='account_vp_" + id + "' class='vp'> </div> </div><div id='account_rep_" + id + "'> </div>");
                        getRep(id, $('div#account_rep_' + id), settings['nodes']);
                        getVP(id, $('div#account_vp_' + id), settings['server']);
                    }
                }                
            }
            $('select#server').val(settings['server']);
            // get node infor
            $('select#nodes').val(settings['nodes']);
            getNodeInfo(settings['nodes'], $('div#nodeinfo'));
            // get server api blocknumber    
            getServerInfo(settings['server'], $('div#serverinfo'));
            $('input#posting_key').val(settings['posting_key']);            
        }
    });
    $('button#save_btn').click(function() {
        let id = $('input#steemit_id').val().trim();
        let server = $('select#server').val();
        let friends = $('textarea#friends').val();
        let posting_key = $('input#posting_key').val().trim();
        let nodes = $('select#nodes').val();
        let settings = {};
        settings['steemit_id'] = id;
        settings['server'] = server;
        settings['friends'] = friends;
        settings['posting_key'] = posting_key;
        settings['nodes'] = nodes;
        chrome.storage.sync.set({ 
            steemtools: settings
        }, function() {
            alert('Settings Saved (Required: Reload Extension)');
        });
    });  
    // about
    let manifest = chrome.runtime.getManifest();    
    let app_name = manifest.name + " v" + manifest.version;
    $('textarea#about').val('Application: ' + app_name + '\n' + 'Chrome Version: ' + getChromeVersion());
    // rep calculator
    $('button#btn_rep').click(function() {
        let rep = parseInt($('input#steemit_reputation').val());
        let reputation = steem.formatter.reputation(rep);
        $('div#rep_result').html("Reputation of " + rep + " = <B>" + reputation + "</B>");
    })
    // delegation form
    $('input#delegate_btn').click(function() {
        let delegator = $("input#delegator").val().toLowerCase().trim();
        let delegatee = $("input#delegatee").val().toLowerCase().trim();
        let amount = $("input#amount").val().trim();
        let unit = $("#unit").val().trim();
        if (delegatee == '') {
            alert('Required Field: Delegatee ID');
            $("input#delegatee").focus();
            return;
        }
        if (amount == '') {
            alert('Required: Amount to Delegate');
            $("input#amount").focus();
            return;
        }      
        let steemconnect = "https://v2.steemconnect.com/sign/delegateVestingShares?delegator=" + delegator + "&delegatee=" + delegatee + "&vesting_shares=" + amount + " " + unit; 
        chrome.tabs.create({ url: steemconnect });        
    });  
}, false);