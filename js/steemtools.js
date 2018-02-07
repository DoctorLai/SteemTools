'use strict';

// default api node
const default_node = 'https://api.steemit.com';
steem.api.setOptions({ url: default_node });

// default server
const default_server = 'helloacm.com';

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

// return current API server
const getServer = () => {
    let server = $('select#server').val();
    return server;
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

// log in the textarea
const logit = (msg) => {
    let d = new Date();
    let n = d.toLocaleTimeString();
    let dom = $('textarea#about');
    let s = dom.val();
    dom.val(s + "\n" + n + ": " + msg);
}

// get voting power
function getVP(id, dom, server) {
    server = server || default_node;
    steem.api.setOptions({ url: server });

    steem.api.getAccounts([id], function(err, response) {
        if (!err) {
            let result = (response[0].voting_power) / 100;
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
            logit("API Finished: VP - " + server + ": " + id);
        } else {
            logit("API error: " + server + ": " + err);
        }
    });   
}

// get curation stats
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

// get reputation 
const getRep = (id, dom, server) => {
    server = server || default_node;
    steem.api.setOptions({ url: server });

    steem.api.getAccounts([id], function(err, result) {
        if (!err) {
            dom.html("<i>@" + id + "'s Reputation is</i> <B>" + steem.formatter.reputation(result[0]['reputation']) + "</B>");
            logit("getRep Finished: " + server + ": " + id);
        } else {
            logit("getRep Error: " + err);
        }
    });    
}

// get account value
const getAccountValue = (id, dom, server) => {
    server = server || default_node;
    steem.api.setOptions({ url: server });

    steem.api.getAccounts([id], function(err, result) {
        if (!err) {
            var av = steem.formatter.estimateAccountValue(result[0]);
            av.then(x => {
                dom.html("<i>@" + id + "'s Account Value is</i> <B>$" + x + "</B>");
            });
            logit("getAccountValue Finished: " + server + ": " + id);
        } else {
            logit("getAccountValue Error: " + err);
        }
    });    
}

// get api server infor
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

// get node infor
function getNodeInfo(server, dom) {
    let api = server;
    logit("calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = "<ul>";
            s += "<li><B>Node: </B>" + server + "</li>";
            if (result['status'] !== undefined) {
                s += "<li><B>Status: </B>" + result['status'] + "</li>";
                s += "<li><B>Timestamp: </B>" + result['datetime'] + "</li>";
                s += "<li><B>Commit: </B>" + result['source_commit'] + "</li>";
                s += "<li><B>Docker: </B>" + result['docker_tag'] + "</li>";
            } else {
                s += "<h5>Raw Header</h5>";
                s += "<pre>";
                s += result;
                s += "</pre>";
            }
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

// on document ready
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
                let id = prepareId(settings["steemit_id"]);
                $('input#steemit_id').val(id);  
                if (validId(id)) {
                    let tid = getIdForDiv(id);
                    getVP(id, $("div#account_vp"), settings['server']);
                    getRep(id, $("div#account_rep"), settings['nodes']);
                    getAccountValue(id, $("div#account_value"), settings['nodes']);
                    $('input#delegator').val(id);
                    $('input#delid').val(id);
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
                    let id = prepareId(friends[i]);
                    if (validId(id)) {
                        let tid = getIdForDiv(id);
                        $("div#friends_vp_rep").append("<div id='account_vp_100_" + tid + "' class='vpbar'><div id='account_vp_" + tid + "' class='vp'> </div> </div>");
                        $("div#friends_vp_rep").append("<div id='account_rep_" + tid + "'> </div>");
                        $("div#friends_vp_rep").append("<div id='account_value_" + tid + "'> </div>");
                        getRep(id, $('div#account_rep_' + tid), settings['nodes']);
                        getVP(id, $('div#account_vp_' + tid), settings['server']);
                        getAccountValue(id, $('div#account_value_' + tid), settings['server']);
                    }
                }                
            }            
            // get node infor
            $('select#nodes').val(settings['nodes']);
            getNodeInfo(settings['nodes'], $('div#nodeinfo'));
            // get server api blocknumber    
            $('select#server').val(settings['server']);
            getServerInfo(settings['server'], $('div#serverinfo'));
            $('input#posting_key').val(settings['posting_key']);            
        } else {
            // get node infor
            $('select#nodes').val(default_node);
            getNodeInfo(default_node, $('div#nodeinfo'));
            // get server api blocknumber    
            $('select#server').val(default_server);
            getServerInfo(default_server, $('div#serverinfo'));            
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
    // basic information search
    // search a id when press Enter
    textPressEnterButtonClick($('input#steem_basic'), $('button#btn_basic'));
    $('button#btn_basic').click(function() {
        let id = prepareId($('input#steem_basic').val());
        if (validId(id)) {
            let nodes = $('select#nodes').val();
            let server = $('select#server').val();
            getRep(id, $('div#basic_result_rep'), nodes);
            getVP(id, $('div#basic_result_vp'), server);
            getAccountValue(id, $('div#basic_result_value'), nodes);
        } else {
            alert('Not a Valid Steem ID.');
        }
    });
    // find a list of delegatees
    // search a id when press Enter
    textPressEnterButtonClick($('input#delid'), $('button#delegatees_btn'));
    $('button#delegatees_btn').click(function() {
        let id = prepareId($('input#delid').val());
        let server = getServer();
        $('div#delegatees_div').html('<img src="images/loading.gif"/>');
        if (validId(id)) {
            $.ajax({ 
                dataType: "json",
                url: "https://" + server + "/api/steemit/delegatees/?cached&id="+id,
                cache: false,
                success: function (response) {
                    let result = response;
                    if (result && result.length > 0) {
                        let s = '<h4><B>' + result.length + '</B> Delegatee(s) <div id="stats"> </div></h4>';
                        s += '<table id="dvlist" class="sortable">';
                        s += '<thead><tr><th>Delegatee</th><th>Steem Power (SP)</th><th>Vests</th><th>Time</th></tr></thead><tbody>';
                        let total_sp = 0;
                        let total_vest = 0;
                        for (let i = 0; i < result.length; i ++) {
                            total_sp += result[i]['sp'];
                            total_vest += result[i]['vests'];  
                            s += '<tr>';
                            s += '<td><a target=_blank rel=nofollow href="https://steemit.com/@' + result[i]['delegatee'] + '">@' + result[i]['delegatee'] + '</a><BR/><img style="width:75px;height:75px" src="https://steemitboard.com/@' + result[i]['delegatee'] + '/level.png"></td>';
                            s += '<td>' + (result[i]['sp']).toFixed(2) + '</td>';
                            s += '<td>' + (result[i]['vests']).toFixed(2) + '</td>';
                            s += '<td>' + result[i]['time'] + '</td>';
                            s += '</tr>';
                        }              
                        s += '</tbody>';
                        s += '<tfoot><tr>';
                        s += '<th>Total: </th><th></th><th>' + (total_sp.toFixed(2)) + ' SP</th><th>' + (total_vest.toFixed(2)) + ' VESTS</th><th></th>'; 
                        s += '</tr></tfoot>';
                        s += '</table>';
                        $('div#delegatees_div').html(s);
                        $('div#delegatees_div_stats').html(total_sp.toFixed(2) + " SP, " + total_vest.toFixed(2) + " VESTS");
                        sorttable.makeSortable(document.getElementById("dvlist"));
                    } else {
                        $('div#delegatees_div').html("<font color=blue>It could be any of these: (1) No Delegatees (2) Invalid ID (3) API or SteemSQL server failed. Contact <a rel=nofollow target=_blank href='https://steemit.com/@justyy/'>@justyy</a> if you are not sure. Thanks!</font>");
                    }          
                },
                error: function(request, status, error) {
                    $('div#delegatees_div').html('<font color=red>API/SteemSQL Server (' + server + error + ') is currently offline. Please try again later!' + request.responseText + '</font>');
                },          
                complete: function(data) {
                
                }
            });
        } else {
            alert('Not a Valid Steem ID.');
        }        
    })
}, false);