'use strict';

// default api node
const default_node = 'https://api.steemit.com';
steem.api.setOptions({ url: default_node });
// default server
const default_server = 'helloacm.com';

// get Node
const getNode = () => {
    return $('select#nodes').val();
}

// return current API server
const getServer = () => {
    let server = $('select#server').val();
    return server;
}

// log in the textarea
const logit = (dom, msg) => {
    if ((msg == undefined) || (msg == null)) {
        return;
    }
    let d = new Date();
    let n = d.toLocaleTimeString();    
    let s = dom.val();
    dom.val((s + "\n" + n + ": " + msg).trim());
}

// get voting power
function getVP(id, dom, server) {
    server = server || default_node;
    steem.api.setOptions({ url: server });

    steem.api.getAccounts([id], function(err, response) {
        if (!err) {
            let result = response[0].voting_power;
            let last_vote_time = response[0].last_vote_time;
            let diff = (Date.now() - Date.parse(last_vote_time)) / 1000;
            let regenerated_vp = diff * 10000 / 86400 / 5;
            let total_vp = (result + regenerated_vp) / 100;
            total_vp = Math.min(100, total_vp);
            dom.html("<i>@" + id + "'s Voting Power is</i> <B>" + total_vp.toFixed(2) + "%</B>");
            if (result < 30) {
                dom.css("background-color", "red");
            } else if (result < 60) {
                dom.css("background-color", "orange");
            } else {
                dom.css("background-color", "green");
            }
            dom.css("color", "white");
            dom.css("width", total_vp + "%");
            logit($('textarea#about'), "API Finished: VP - " + server + ": " + id);
        } else {
            logit($('textarea#about'), "API error: " + server + ": " + err);
        }
    });   
}

// get curation stats
function getCuration(id, dom, server) {
    server = server || default_server;
    let api = 'https://' + server + '/api/steemit/account/curation/?cached&id=' + id;
    logit($('textarea#about'), "calling " + api);
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
            logit($('textarea#about'), 'Response: ' + request.responseText);
            logit($('textarea#about'), 'Error: ' + error );
            logit($('textarea#about'), 'Status: ' + status);
        },
        complete: function(data) {
            logit($('textarea#about'), "API Finished: " + api);
        }             
    });    
}

function getRep(id, dom, server) {
    server = server || default_node;
    steem.api.setOptions({ url: server });

    steem.api.getAccounts([id], function(err, response) {
        if (!err){
            let result = formatReputation(response[0].reputation);
            dom.html("<i>@" + id + "'s Reputation is</i> <B>" + result + "</B>");
            logit($('textarea#about'), "API Finished: Reputation/Account Value - " + id);
        } else {
            logit($('textarea#about'), "API error: " + id + ": " + err);
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
            logit($('textarea#about'), "getAccountValue Finished: " + server + ": " + id);
        } else {
            logit($('textarea#about'), "getAccountValue Error: " + err);
        }
    });    
}

// get api server infor
function getServerInfo_sbds(server, dom) {
    server = server || default_server;
    let api = 'https://' + server + '/api/steemit/blocknumber/sbds';
    logit($('textarea#about'), "calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = "<ul>";
            s += "<li><B>Server: </B>" + server + "</li>";
            s += "<li><B>SBDS Block Number: </B><a target=_blank href='https://steemdb.com/block/" + result['block_num'] + "'>" + result['block_num'] + "</a></li>";
            s += "<li><B>Timestamp: </B>" + result['timestamp'] + "</li>";
            s += "<li><B>Gap: </B>" + result['seconds'] + " seconds</li>";
            s += "</ul>";
            dom.html(s);
        },
        error: function(request, status, error) {
            logit($('textarea#about'), 'Response: ' + request.responseText);
            logit($('textarea#about'), 'Error: ' + error );
            logit($('textarea#about'), 'Status: ' + status);
        },
        complete: function(data) {
            logit($('textarea#about'), "API Finished: " + api);
        }             
    });      
}

// get api server infor
function getServerInfo(server, dom) {
    server = server || default_server;
    let api = 'https://' + server + '/api/steemit/blocknumber/steemsql';
    logit($('textarea#about'), "calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = "<ul>";
            s += "<li><B>Server: </B>" + server + "</li>";
            s += "<li><B>SteemSQL Block Number: </B><a target=_blank href='https://steemdb.com/block/" + result['block_num'] + "'>" + result['block_num'] + "</a></li>";
            s += "<li><B>Timestamp: </B>" + result['timestamp'] + "</li>";
            s += "<li><B>Gap: </B>" + result['seconds'] + " seconds</li>";
            s += "</ul>";
            dom.html(s);
        },
        error: function(request, status, error) {
            logit($('textarea#about'), 'Response: ' + request.responseText);
            logit($('textarea#about'), 'Error: ' + error );
            logit($('textarea#about'), 'Status: ' + status);
        },
        complete: function(data) {
            logit($('textarea#about'), "API Finished: " + api);
        }             
    });      
}

// get node infor
function getNodeInfo(server, dom) {
    let api = server;
    logit($('textarea#about'), "calling " + api);
    $.ajax({
        type: "GET",
        url: api,
        success: function(result) {
            let s = "<ul>";
            s += "<li><B>Node: </B>" + server + "</li>";
            if (result['status'] !== undefined) {
                s += "<li><B>Status: </B>" + result['status'] + "</li>";
                s += "<li><B>Timestamp: </B>" + result['datetime'] + "</li>";
                let dt = new Date();
                let cur = new Date(result['datetime'].replace("T", " "));
                let seconds = dt.getTime() - cur.getTime();
                seconds = Math.abs(seconds) / 1000;
                s += "<li><B>Gap: </B>" + seconds + " seconds</li>";
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
            logit($('textarea#about'), 'Response: ' + request.responseText);
            logit($('textarea#about'), 'Error: ' + error );
            logit($('textarea#about'), 'Status: ' + status);
        },
        complete: function(data) {
            logit($('textarea#about'), "API Finished: " + server);
        }             
    });    
}

const handleAccountWitness = () => {
    textPressEnterButtonClick($('input#witness_id2'), $('button#witness_btn2'));
    $('button#witness_btn2').click(function() {        
        let id = prepareId($('input#witness_id2').val());
        let server = getServer();        
        server = server || default_server;
        $('div#witness_div2').html('<img src="images/loading.gif"/>');
        if (validId(id)) {
            // disable the button while API is not finished yet.
            $('button#witness_id2').attr("disabled", true);
            $.ajax({ 
                dataType: "json",
                url: "https://" + server + "/api/steemit/account/witness/?cached&id="+id,
                cache: false,
                success: function (response) {
                    let result = response;
                    if (result && result.length > 0) {
                      let s = '<h4><B>' + result.length + '</B> Witnesses (Your Votes) - <a target=_blank href="https://helloacm.com/tools/steemit/witness/?id=' + id + '">View Complete Data</a></h4>';
                      s += '<table id="dvlist_witness2" class="sortable">';
                      s += '<thead><tr><th>Witness</th><th>Status</th><th>Votes (MV)</th><th>Votes Count</th><th>Total Produced</th><th>Miss Rate %</th><th>Missed</th><th>Last Block</th></tr></thead><tbody>';
                      for (let i = 0; i < result.length; i ++) {
                            s += '<tr>';
                            s += '<td>' + getSteemUrl(result[i]['name']) + ' <BR/>(';
                            s += '<a rel=nofollow target=_blank href="' + result[i]['url'] + '">Post</a>)</td>';
                            let status = "<font color='green'>Yes</font>";
                            if (result[i]['signing_key'].includes("1111111111")) {
                                status = "<font color='red'>No</font><BR/><a target=_blank rel=nofollow href='https://steemconnect.com/sign/account_witness_vote?approve=0&witness=" + result[i]['name'] + "'><font color=red><B>Unvote</B></font></a>";
                            }
                            s += '<td>' + status + ' (<a rel="nofollow" target=_blank href="https://helloacm.com/api/echo/?s=' + result[i]['signing_key'] + '" title="' + result[i]['signing_key'] + '">Signing Key</a>)</td>';
                            s += '<td>' + Math.round(result[i]['votes']/1000000000000) + '</td>';
                            s += '<td>' + result[i]['votes_count'] + '</td>';
                            s += '<td>' + result[i]['total'] + '</td>';
                            s += '<td>' + result[i]['miss_rate'].toFixed(2) + '</td>';                
                            s += '<td>' + result[i]['total_missed'] + '</td>';
                            s += '<td>' + result[i]['last_aslot'] + '</td>';
                            s += '</tr>';
                          }              
                          s += '</tbody>';
                          s += '</table>';
                        $('div#witness_div2').html(s);
                        sorttable.makeSortable(document.getElementById("dvlist_witness2"));
                    } else {
                        $('div#witness_div2').html("<font color=blue>It could be any of these: (1) No Voted Witnesses or You are set using Witness Proxy (2) Invalid ID (3) API/SteemSQL server failed. Contact <a rel=nofollow target=_blank href='https://steemit.com/@justyy/'>@justyy</a> if you are not sure. Thanks!</font>");
                    }          
                },
                error: function(request, status, error) {
                    $('div#witness_div2').html('<font color=red>API/SteemSQL Server (' + server + error + ') is currently offline. Please try again later!' + request.responseText + '</font>');
                },          
                complete: function(data) {
                    // re-enable the button
                    $('button#witness_btn2').attr("disabled", false);
                }
            });
        } else {
            alert('Not a Valid Steem ID.');
            $('div#witness_div2').html('');
        }        
    });      
}

// profile API
const handleProfile = (dom, input, btn) => {
    textPressEnterButtonClick(input, btn);
    let server = getServer();        
    server = server || default_server;
    let id = prepareId($(input).val());
    dom.html('<img src="images/loading.gif"/>');
    btn.attr("disabled", true);
    $.ajax({ 
        dataType: "json",
        url: "https://" + server + "/api/steemit/account/profile/?cached&id=" + id,
        cache: false,
        error: function(request, status, error) {
            dom.html('<font color=red>API/SteemSQL Server (' + server + error + ') is currently offline. Please try again later!' + request.responseText + '</font>');
        },          
        complete: function(data) {
            // re-enable the button
            btn.attr("disabled", false);
        },
        success: function (response) {
            let result = response;
            if (result) {
                let s = '';
                s += '<table>';
                s += '<thead><tr><th style="width:30%">Key</th><th>Value</th></tr></thead><tbody>';

                const addKeyValue = (result, x) => {
                    return "<tr><td>" + x + "</td><td>" + result[x] + "</td></tr>";
                }

                s += addKeyValue(result, "id");
                s += addKeyValue(result, "created");
                s += addKeyValue(result, "last_vote_time");
                s += addKeyValue(result, "steem");
                s += addKeyValue(result, "rep");
                s += addKeyValue(result, "online");
                s += addKeyValue(result, "vests");
                s += addKeyValue(result, "sbd");
                s += addKeyValue(result, "value");
                s += addKeyValue(result, "vp");
                s += "<tr><td>received_sp</td><td>" + result['esp']['received_sp'] + "</td></tr>";
                s += "<tr><td>delegated_vesting_shares</td><td>" + result['esp']['delegated_vesting_shares'] + "</td></tr>";
                s += "<tr><td>effective_vesting_shares</td><td>" + result['esp']['effective_vesting_shares'] + "</td></tr>";
                s += "<tr><td>vesting_shares</td><td>" + result['esp']['vesting_shares'] + "</td></tr>";
                s += "<tr><td>received_vesting_shares</td><td>" + result['esp']['received_vesting_shares'] + "</td></tr>";
                s += "<tr><td>vesting_sp</td><td>" + result['esp']['vesting_sp'] + "</td></tr>";
                s += "<tr><td>esp</td><td>" + result['esp']['esp'] + "</td></tr>";
                s += "<tr><td>delegated_sp</td><td>" + result['esp']['delegated_sp'] + "</td></tr>";
                s += '</tbody>';
                s += '</table>';
                dom.html(s);                          
            } else {
                dom.html('');
            }      
        }           
    });
}

// steem blockchain information
const getInfor = (dom) => {
    let server = getServer();        
    server = server || default_server;
    dom.html('<img src="images/loading.gif"/>');
    $.ajax({ 
        dataType: "json",
        url: "https://" + server + "/api/steemit/info/",
        cache: false,
        success: function (response) {
            let result = response;
            if (result) {
                let s = '';
                s += '<table>';
                s += '<thead><tr><th style="width:30%">Key</th><th>Value</th></tr></thead><tbody>';

                const addKeyValue = (result, x) => {
                    return "<tr><td>" + x + "</td><td>" + result[x] + "</td></tr>";
                }

                s += addKeyValue(result, "account_num");
                s += addKeyValue(result, "time");
                s += addKeyValue(result, "last_irreversible_block_num");
                s += addKeyValue(result, "head_block_number");
                s += addKeyValue(result, "hardfork_version");
                s += addKeyValue(result, "market_price");
                s += addKeyValue(result, "feed_price");
                s += "<tr><td>blockchain_version</td><td>" + result['version']['blockchain_version'] + "</td></tr>";
                s += "<tr><td>steem_revision</td><td>" + result['version']['steem_revision'] + "</td></tr>";
                s += "<tr><td>fc_revision</td><td>" + result['version']['fc_revision'] + "</td></tr>";
                s += '</tbody>';
                s += '</table>';
                dom.html(s);                          
            } else {
                dom.html('');
            }      
        }           
    });
}

// handle delegation form
const handleDelegationForm = () => {
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
}

// save settings
const saveSettings = (msg = true) => {
    let id = $('input#steemit_id').val().trim();
    let server = $('select#server').val();
    let friends = $('textarea#friends').val();
    let posting_key = $('input#posting_key').val().trim();
    let nodes = $('select#nodes').val();
    let steemjs = $('textarea#steemjs-source').val().trim();
    let settings = {};
    settings['steemit_id'] = id;
    settings['server'] = server;
    settings['friends'] = friends;    
    settings['nodes'] = nodes;
    settings['steemjs'] = steemjs;
    settings['wallet_amount'] = $('input#wallet_amount').val().trim();
    settings['wallet_memo'] = $('input#wallet_memo').val().trim();
    settings['accounts_to_send_list'] = $('textarea#accounts_to_send_list').val().trim();
    settings['wallet_unit'] = $('select#wallet_unit').val().trim();
    let save_key = $('input#save_key').is(':checked');
    settings['save_key'] = save_key;
    if (save_key) {
        settings['posting_key'] = posting_key;
    }
    chrome.storage.sync.set({ 
        steemtools: settings
    }, function() {
        if (msg) {
            alert('Settings Saved (Required: Reload Extension)');
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
            if (settings['wallet_amount']) {
                $('input#wallet_amount').val(settings['wallet_amount']);
            }
            if (settings['wallet_memo']) {
                $('input#wallet_memo').val(settings['wallet_memo']);
            }
            if (settings['accounts_to_send_list']) {
                $('textarea#accounts_to_send_list').val(settings['accounts_to_send_list']);
            }
            if (settings['wallet_unit']) {
                $('select#wallet_unit').val(settings['wallet_unit']);
            }
            if (settings["steemit_id"]) {
                let id = prepareId(settings["steemit_id"]);
                $('input#steemit_id').val(id);  
                if (validId(id)) {
                    let tid = getIdForDiv(id);
                    getVP(id, $("div#account_vp"), settings['server']);
                    getRep(id, $("div#account_rep"), settings['nodes']);
                    getAccountValue(id, $("div#account_value"), settings['nodes']);
                    $('input#delegator').val(id);
                    $('input#delegatorid').val(id);
                    $('input#delid').val(id);
                    $('input#deleted_id').val(id);
                    $('input#powerdown_id').val(id);
                    $('input#downvoters_id').val(id);
                    $('input#witness_id').val(id);
                    $('input#witness_id2').val(id);
                    $('input#account_id').val(id);
                    $('a#profile').html("@" + id);
                    $('h4#profile_id').html("@" + id);
                    if (settings['save_key'] !== null) {
                        $('input#save_key').attr("checked", settings['save_key']);
                    }
                    getCuration(id, $("div#profile_data"), settings['server']);
                    $.ajax({ 
                        dataType: "json",
                        url: "https://" + settings['server'] + "/api/steemit/powerdown/?cached&id=" + id,
                        cache: false,
                        success: function (response) {
                            let result = response;
                            if (result && result.length > 0) {
                                let s = '';
                                s += '<h4>Powerdown Status of ' + getSteemUrl(id) + '</h4>';
                                s += '<ul>';
                                s += '<li>Week: ' + result[0]['week'] + '</li>';
                                s += '<li>Vesting Shares: ' + result[0]['vesting_shares'] + '</li>';
                                s += '<li>Steem Power: ' + result[0]['sp'] + '</li>';
                                s += '<li>Timestamp: ' + result[0]['timestamp'] + '</li>';
                                s += '</ul>';
                                $('div#powerdown_data').html(s);
                            } else {
                                $('div#powerdown_data').html("<h5>No Power Down.</h5>");
                            }       
                        },
                        error: function(request, status, error) {
                            logit($('textarea#about'), error);
                        },          
                        complete: function(data) {                                                        
                        }
                    });                    
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
            getServerInfo_sbds(settings['server'], $('div#serverinfo_sbds'));
            if ($('input#save_key').is(":checked")) {
                $('input#posting_key').val(settings['posting_key']);
            }
            // steemjs source
            let steemjs = settings['steemjs'];
            if (steemjs) {
                $('textarea#steemjs-source').val(settings['steemjs']);
            }
        } else {
            // get node infor
            $('select#nodes').val(default_node);
            getNodeInfo(default_node, $('div#nodeinfo'));
            // get server api blocknumber    
            $('select#server').val(default_server);
            getServerInfo(default_server, $('div#serverinfo'));            
            getServerInfo_sbds(default_server, $('div#serverinfo_sbds'));
        }
    });
    $('button#save_btn').click(function() {
        saveSettings();
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
    // check powerdown status
    // search a id when press Enter
    textPressEnterButtonClick($('input#powerdown_id'), $('button#powerdown_btn'));
    $('button#powerdown_btn').click(function() {        
        let id = prepareId($('input#powerdown_id').val());
        let server = getServer();        
        server = server || default_server;
        $('div#powerdown_div').html('<img src="images/loading.gif"/>');
        if (validId(id)) {
            // disable the button while API is not finished yet.
            $('button#powerdown_btn').attr("disabled", true);
            $.ajax({ 
                dataType: "json",
                url: "https://" + server + "/api/steemit/powerdown/?cached&id="+id,
                cache: false,
                success: function (response) {
                    let result = response;
                    if (result && result.length > 0) {
                        let s = '';
                        s += '<h4>Powerdown Status of ' + getSteemUrl(id) + '</h4>';
                        s += '<ul>';
                        s += '<li>Week: ' + result[0]['week'] + '</li>';
                        s += '<li>Vesting Shares: ' + result[0]['vesting_shares'] + '</li>';
                        s += '<li>Steem Power: ' + result[0]['sp'] + '</li>';
                        s += '<li>Timestamp: ' + result[0]['timestamp'] + '</li>';
                        s += '</ul>';
                        $('div#powerdown_div').html(s);
                    } else {
                        $('div#powerdown_div').html("<font color=blue>It could be any of these: (1) Currently No Powerdown (2) Invalid ID (3) API or SteemSQL server failed. Contact <a rel=nofollow target=_blank href='https://steemit.com/@justyy/'>@justyy</a> if you are not sure. Thanks!</font>");
                    }          
                },
                error: function(request, status, error) {
                    $('div#powerdown_div').html('<font color=red>API/SteemSQL Server (' + server + error + ') is currently offline. Please try again later!' + request.responseText + '</font>');
                },          
                complete: function(data) {
                    // re-enable the button
                    $('button#powerdown_btn').attr("disabled", false);
                }
            });
        } else {
            alert('Not a Valid Steem ID.');
            $('div#powerdown_div').html('');
        }        
    });          
    // check who downvoted you
    // search a id when press Enter
    textPressEnterButtonClick($('input#downvoters_id'), $('button#downvote_btn'));
    $('button#downvote_btn').click(function() {        
        let id = prepareId($('input#downvoters_id').val());
        let server = getServer();        
        server = server || default_server;
        $('div#downvoters_div').html('<img src="images/loading.gif"/>');
        if (validId(id)) {
            // disable the button while API is not finished yet.
            $('button#downvote_btn').attr("disabled", true);
            $.ajax({ 
                dataType: "json",
                url: "https://" + server + "/api/steemit/downvote/?cached&id="+id,
                cache: false,
                success: function (response) {
                    let result = response;
                    if (result && result.length > 0) {
                        let s = '<h4><B>' + result.length + '</B> downvotes in the past year.</h4>';
                        s += '<table id="downvote_list" class="sortable">';
                        s += '<thead><tr><th>Down-Voter</th><th>Permlink</th><th>Weight %</th><th>Time</th></tr></thead><tbody>';
                        let total = 0;
                        for (let i = 0; i < result.length; ++ i) {
                            s += '<tr>';
                            total += result[i]['weight'] / 100;
                            s += '<td>' + getSteemUrl(result[i]['voter']) + '<BR/><img style="width:75px;height:75px" src="https://steemitboard.com/@' + result[i]['voter'] + '/level.png"></td>';
                            s += '<td>' + '<a target=_blank rel=nofollow href="https://steemit.com/@' + id + '/' + result[i]['permlink'] + '">' + result[i]['permlink'] + '</a></td>';
                            s += '<td>' + (result[i]['weight']/100).toFixed(2) + '</td>';
                            s += '<td>' + result[i]['time'] + '</td>';
                            s += '</tr>';
                        }              
                        s += '<tfoot><tr>';
                        s += '<th>Total: </th><th></th><th></th><th>' + total.toFixed(2) + '</th><th></th>'; 
                        s += '</tr></tfoot>';
                        s += '</table>';                 
                        $('div#downvoters_div').html(s);
                        sorttable.makeSortable(document.getElementById("downvote_list"));
                    } else {
                        $('div#downvoters_div').html("<font color=blue>It could be any of these: (1) No Deleted Comments (2) Invalid ID (3) API or SteemSQL server failed. Contact <a rel=nofollow target=_blank href='https://steemit.com/@justyy/'>@justyy</a> if you are not sure. Thanks!</font>");
                    }          
                },
                error: function(request, status, error) {
                    $('div#downvoters_div').html('<font color=red>API/SteemSQL Server (' + server + error + ') is currently offline. Please try again later!' + request.responseText + '</font>');
                },          
                complete: function(data) {
                    // re-enable the button
                    $('button#downvote_btn').attr("disabled", false);
                }
            });
        } else {
            alert('Not a Valid Steem ID.');
            $('div#downvoters_div').html('');
        }        
    });   
    // find account witness information
    // search a id when press Enter
    handleAccountWitness();      
    // find witness information
    // search a id when press Enter
    textPressEnterButtonClick($('input#witness_id'), $('button#witness_btn'));
    $('button#witness_btn').click(function() {        
        let id = prepareId($('input#witness_id').val());
        let server = getServer();        
        server = server || default_server;
        $('div#witness_div').html('<img src="images/loading.gif"/>');
        if (validId(id)) {
            // disable the button while API is not finished yet.
            $('button#witness_id').attr("disabled", true);
            $.ajax({ 
                dataType: "json",
                url: "https://" + server + "/api/steemit/witness/?cached&id="+id,
                cache: false,
                success: function (response) {
                    let result = response;
                    if (result && result.length > 0) {
                        let s = '<h4>Witness Details for ' + getSteemUrl(id) + '</h4>';
                        s += '<table id="dvlist_witness">';
                        s += '<thead><tr><th style="width:30%">Key</th><th>Value</th></tr></thead><tbody>';
                        s += "<tr><td>signing_key</td><td><pre>" + result[0]['signing_key'] + "</pre></td></tr>";

                        const addKeyValue = (result, x) => {
                            return "<tr><td>" + x + "</td><td>" + result[0][x] + "</td></tr>";
                        }

                        s += addKeyValue(result, "total_missed");
                        s += addKeyValue(result, "total");
                        s += addKeyValue(result, "miss_rate");
                        s += addKeyValue(result, "last_confirmed_block_num");
                        s += addKeyValue(result, "running_version");
                        s += "<tr><td>witness_post</td><td><a target=_blank href='" + result[0]['url'] + "'>" + result[0]['url'] + "</a></td></tr>";
                        s += addKeyValue(result, "votes");
                        s += addKeyValue(result, "votes_count");
                        s += addKeyValue(result, "last_aslot");
                        s += addKeyValue(result, "hardfork_version_vote");
                        s += addKeyValue(result, "hardfork_time_vote");
                        s += addKeyValue(result, "created");
                        s += addKeyValue(result, "account_creation_fee");
                        s += addKeyValue(result, "account_creation_fee_symbol");
                        s += addKeyValue(result, "maximum_block_size");
                        s += addKeyValue(result, "sbd_interest_rate");
                        s += addKeyValue(result, "sbd_exchange_rate_base");
                        s += addKeyValue(result, "sbd_exchange_rate_base_symbol");
                        s += addKeyValue(result, "sbd_exchange_rate_quote");                        
                        s += addKeyValue(result, "sbd_exchange_rate_quote_symbol");                        
                        s += addKeyValue(result, "last_sbd_exchange_update");                        
                        
                        s += '</tbody>';
                        s += '</table>';
                        $('div#witness_div').html(s);
                        sorttable.makeSortable(document.getElementById("dvlist_witness"));
                    } else {
                        $('div#witness_div').html("<font color=blue>It could be any of these: (1) Not a Witness Account (2) Invalid ID (3) API or SteemSQL server failed. Contact <a rel=nofollow target=_blank href='https://steemit.com/@justyy/'>@justyy</a> if you are not sure. Thanks!</font>");
                    }          
                },
                error: function(request, status, error) {
                    $('div#witness_div').html('<font color=red>API/SteemSQL Server (' + server + error + ') is currently offline. Please try again later!' + request.responseText + '</font>');
                },          
                complete: function(data) {
                    // re-enable the button
                    $('button#witness_btn').attr("disabled", false);
                }
            });
        } else {
            alert('Not a Valid Steem ID.');
            $('div#witness_div').html('');
        }        
    });     
    // delegation form
    handleDelegationForm(); 
    // find a list of deleted comments
    // search a id when press Enter
    textPressEnterButtonClick($('input#deleted_id'), $('button#deleted_btn'));
    $('button#deleted_btn').click(function() {        
        let id = prepareId($('input#deleted_id').val());
        let server = getServer();        
        server = server || default_server;
        $('div#deleted_div').html('<img src="images/loading.gif"/>');
        if (validId(id)) {
            // disable the button while API is not finished yet.
            $('button#deleted_btn').attr("disabled", true);
            $.ajax({ 
                dataType: "json",
                url: "https://" + server + "/api/steemit/deleted/?cached&id="+id,
                cache: false,
                success: function (response) {
                    let result = response;
                    if (result && result.length > 0) {
                        let s = '<h4><B>' + result.length + '</B> Deleted Comments/Posts(s)</h4>';
                        s += '<table id="dvlist_deleted" class="sortable">';
                        s += '<thead><tr><th>Block Number</th><th>Permlink</th><th>Post</th><th>Witness</th><th>Time</th></tr></thead><tbody>';
                        for (var i = 0; i < result.length; i ++) {
                            s += '<tr>';
                            s += '<td>' + result[i]['block_num'] + '</td>';
                            var x = encodeURIComponent("https://steemit.com/@" + id + "/" + result[i]['permlink']);
                            var y = restore(result[i]['permlink']);
                            s += '<td><a target=_blank rel=nofollow href="https://phist.steemdata.com/history?identifier=' + x + '">' + result[i]['permlink'] + '</a></td>';
                            s += '<td><a target=_blank rel=nofollow href="' + y + '">' + 'Post' + '</a></td>';                                
                            s += '<td><a target=_blank rel=nofollow href="https://steemit.com/@' + result[i]['witness'] + '">@' + result[i]['witness'] + '</a><BR/><img style="width:75px;height:75px" src="https://steemitboard.com/@' + result[i]['witness'] + '/level.png"></td>';
                            s += '<td>' + result[i]['time'] + '</td>';
                            s += '</tr>';
                        }              
                        s += '</tbody>';
                        s += '</table>';
                        $('div#deleted_div').html(s);
                        sorttable.makeSortable(document.getElementById("dvlist_deleted"));
                    } else {
                        $('div#deleted_div').html("<font color=blue>It could be any of these: (1) No Deleted Comments (2) Invalid ID (3) API or SteemSQL server failed. Contact <a rel=nofollow target=_blank href='https://steemit.com/@justyy/'>@justyy</a> if you are not sure. Thanks!</font>");
                    }          
                },
                error: function(request, status, error) {
                    $('div#deleted_div').html('<font color=red>API/SteemSQL Server (' + server + error + ') is currently offline. Please try again later!' + request.responseText + '</font>');
                },          
                complete: function(data) {
                    // re-enable the button
                    $('button#deleted_btn').attr("disabled", false);
                }
            });
        } else {
            alert('Not a Valid Steem ID.');
            $('div#deleted_div').html('');
        }        
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
    // find a list of delegators
    // search a id when press Enter
    textPressEnterButtonClick($('input#delegatorid'), $('button#delegators_btn'));
    $('button#delegators_btn').click(function() {
        let id = prepareId($('input#delegatorid').val());
        let server = getServer();
        server = server || default_server;
        $('div#delegators_div').html('<img src="images/loading.gif"/>');
        if (validId(id)) {
            // disable the button while API not return yet.
            $('button#delegators_btn').attr('disabled', true);
            $.ajax({ 
                dataType: "json",
                url: "https://" + server + "/api/steemit/delegators/?cached&id="+id,
                cache: false,
                success: function (response) {
                    let result = response;
                    if (result && result.length > 0) {
                        let s = '<h4><B>' + result.length + '</B> Delegator(s)</h4>';
                        s += '<table id="dvlist2" class="sortable">';
                        s += '<thead><tr><th>Delegator</th><th>Steem Power (SP)</th><th>Vests</th><th>Time</th></tr></thead><tbody>';
                        let total_sp = 0;
                        let total_vest = 0;
                        for (let i = 0; i < result.length; i ++) {
                            total_sp += result[i]['sp'];
                            total_vest += result[i]['vests'];  
                            s += '<tr>';
                            s += '<td><a target=_blank rel=nofollow href="https://steemit.com/@' + result[i]['delegator'] + '">@' + result[i]['delegator'] + '</a><BR/><img style="width:75px;height:75px" src="https://steemitboard.com/@' + result[i]['delegator'] + '/level.png"></td>';
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
                        $('div#delegators_div').html(s);
                        $('div#delegators_div_stats').html(total_sp.toFixed(2) + " SP, " + total_vest.toFixed(2) + " VESTS");
                        sorttable.makeSortable(document.getElementById("dvlist2"));
                    } else {
                        $('div#delegators_div').html("<font color=blue>It could be any of these: (1) No Delegators (2) Invalid ID (3) API or SteemSQL server failed. Contact <a rel=nofollow target=_blank href='https://steemit.com/@justyy/'>@justyy</a> if you are not sure. Thanks!</font>");
                    }          
                },
                error: function(request, status, error) {
                    $('div#delegators_div').html('<font color=red>API/SteemSQL Server (' + server + error + ') is currently offline. Please try again later!' + request.responseText + '</font>');
                },          
                complete: function(data) {
                    // re-enable the button
                    $('button#delegators_btn').attr('disabled', false);
                }
            });
        } else {
            alert('Not a Valid Steem ID.');
            $('div#deleted_div').html('');
        }        
    });            
    // find a list of delegatees
    // search a id when press Enter
    textPressEnterButtonClick($('input#delid'), $('button#delegatees_btn'));
    $('button#delegatees_btn').click(function() {
        let id = prepareId($('input#delid').val());
        let server = getServer();
        server = server || default_server;
        $('div#delegatees_div').html('<img src="images/loading.gif"/>');
        if (validId(id)) {
            // disable the button while waiting for API returns
            $('button#delegatees_btn').attr('disabled', true);
            $.ajax({ 
                dataType: "json",
                url: "https://" + server + "/api/steemit/delegatees/?cached&id="+id,
                cache: false,
                success: function (response) {
                    let result = response;
                    if (result && result.length > 0) {
                        let s = '<h4><B>' + result.length + '</B> Delegatee(s)</h4>';
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
                    // re-enable the button
                    $('button#delegatees_btn').attr('disabled', false);
                }
            });
        } else {
            alert('Not a Valid Steem ID.');
            $('div#deleted_div').html('');
        }        
    });
    // redirecting console
    console.log = function(x) {
        for (let i = 0; i < arguments.length; i++) {
            let x = arguments[i];
            $('div#consolelog').append(x + "<BR/>");
        }                
    }
    // clear
    $('input#btn_clear').click(function() {
        $('div#consolelog').html('');
    });
    // alt + enter to evalute
    // alt + backspace to clear
    $('textarea#steemjs-source').keydown(function (e) {
        if (e.altKey && e.keyCode == 13) {
            $('input#btn_run').click();
            saveSettings(false);
        }
        if (e.altKey && e.keyCode == 8) {
            $('input#btn_clear').click();
        }        
    });    
    $('input#btn_run').click(function() {
        let js = $('textarea#steemjs-source').val();
        try {
            eval(js);
        } catch (e) {
            $('div#consolelog').append("Error: " + e);
        } finally {
            saveSettings(false);
        }
    });
    // save source of steem-js
    $('input#btn_save').click(function() {
        saveSettings();
    });
    // ping tests
    $('button#btn_ping').click(function() {
        // clear the test window
        $('div#ping_result').html('');
        // test all nodes
        $("select#nodes option").each(function() {
            let node = $(this).val();
            ping(node).then(function(delta) {
                let msg = '<i><font color=white>' + node + '</font></i>: ' + 'Ping time was <font color=green>' + String(delta) + '</font> ms<BR/>';                
                $('div#ping_result').append(msg);
            }).catch(function(err) {
                let msg = '<i><font color=white>' + node + '</font></i>: ' + '<font color=red>' + 'Time-out: ' + err + '</font><BR/>';                
                $('div#ping_result').append(msg);
            });            
        });
    });
    // server ping tests
    $('button#btn_server_ping').click(function() {
        // clear the test window
        $('div#ping_server_result').html('');
        // test all nodes
        $("select#server option").each(function() {
            let node = "https://" + $(this).val();
            ping(node).then(function(delta) {
                let msg = '<i><font color=white>' + node + '</font></i>: ' + 'Ping time was <font color=green>' + String(delta) + '</font> ms<BR/>';                
                $('div#ping_server_result').append(msg);
            }).catch(function(err) {
                let msg = '<i><font color=white>' + node + '</font></i>: ' + '<font color=red>' + 'Time-out: ' + err + '</font><BR/>';                
                $('div#ping_server_result').append(msg);
            });            
        });
    });   
    // wallet
    $('button#send_money').click(function() {
        saveSettings(false);
        let amount = $('input#wallet_amount').val().trim();
        let from_user = $('input#steemit_id').val().trim();
        if (from_user == '') {
            logit($('textarea#console_wallet'), "You need to Configure Your Steem ID.");
            return;
        }
        if (isNumeric(amount)) {
            amount = parseFloat(amount);
            if (amount >= 0.001) { // minimal amount to send
                let s = $('textarea#accounts_to_send_list').val().trim();
                let addresses = s.split("\n");
                let unit = $('select#wallet_unit').val().trim();
                let memo = $('input#wallet_memo').val().trim();
                unit = unit || "SBD";
                let count = addresses.length;
                if (s.length > 0) {
                    if (confirm("Send " + amount.toFixed(3) + " " + unit + " to " + addresses.join(',') + " with MEMO=" + memo + "?")) {
                        let active_key = $("input#posting_key").val().trim();                              
                        for (let i = 0; i < count; ++ i) {
                            let who = addresses[i].trim().replace('@', '');
                            if (who.length > 0) {
                                logit($('textarea#console_wallet'), "Sending " + amount.toFixed(3) + " " + unit + " to @" + who + "...");
                                steem.api.setOptions({ url: $("select#nodes").val() });
                                steem.broadcast.transfer(active_key, from_user, who, amount + " " + unit, memo, function(err, result) {
                                    if (err) {
                                        logit($('textarea#console_wallet'), err);
                                    } else {
                                        console.log(result);
                                        logit($('textarea#console_wallet'), amount.toFixed(3) + " " + unit + " sent from @" + from_user + " to @" + who);
                                    }
                                });
                            }
                        }
                    }
                } else {
                    logit($('textarea#console_wallet'), "Please enter recipents line by line.");    
                }
            } else {
                logit($('textarea#console_wallet'), "Need at least 0.001 SBD or STEEM.");
            }
        } else {
            logit($('textarea#console_wallet'), "Invalid Amount.");
        }
    });
    // get information
    getInfor($('div#info_div'));
    // profile
    let input = $('input#account_id');
    let btn = $('button#btn_profile');
    btn.click(function() {
        handleProfile($('div#profile_result'), input, btn);
    });    
}, false);