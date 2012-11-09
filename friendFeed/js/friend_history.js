/*globals R */
function() {
  var oldFriendHistory = window.friendHistory;

	window.friendHistory = {
	  noConflict: oldFriendHistory,

		onRdioReady: function() {
		  console.log("Rdio is ready!");
	  }
	}

	R.ready(friendHistory.onRdioReady);
}();
