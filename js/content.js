(function($) {
	// short cut Alt + S to switch between busy and steemit
	$(document).keydown(function(e) {
	    if (e.key.toLowerCase() == "s" && e.altKey) {
	    	var url = document.location.href;
			if (url.includes("steemit.com")) {
	    		document.location.href = url.replace("steemit.com", "busy.org");
	    	} else if (url.includes("busy.org")) {
	    		document.location.href = url.replace("busy.org", "steemit.com");
	    	}    	
	    }
	});
})(jQuery);