(function($) {
	// short cut Alt + W to switch between busy and steemit
	$(document).keydown(function(e) {
	    if (e && (e.key.toLowerCase() == "w") && e.altKey) {
	    	var url = document.location.href;
			if (url.includes("steemit.com")) {
	    		document.location.href = url.replace("steemit.com", "busy.org");
	    	} else if (url.includes("busy.org")) {
	    		document.location.href = url.replace("busy.org", "steemit.com");
	    	}
	    }
	});
})(jQuery);