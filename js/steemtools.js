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
    server = server || default_server;
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
    server = server || default_server;
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

// save settings
const saveSettings = () => {
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
    settings['posting_key'] = posting_key;
    settings['nodes'] = nodes;
    settings['steemjs'] = steemjs;
    chrome.storage.sync.set({ 
        steemtools: settings
    }, function() {
        alert('Settings Saved (Required: Reload Extension)');
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
                    $('input#delegatorid').val(id);
                    $('input#delid').val(id);
                    $('input#deleted_id').val(id);
                    $('input#downvoters_id').val(id);
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
}, false);