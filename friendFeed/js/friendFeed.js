/*globals R */
(function() {
  var oldFriendHistory = window.rdioFriendFeed;

  var log = function(text) {
    console.log("[FriendFeed] " + text);
  };

  window.rdioFriendFeed = {
    noConflict: oldFriendHistory,

    onRdioReady: function() {
      log("Rdio is ready!");
      
    },

    onPubSub: function() {
    }
  }

  R.ready(rdioFriendFeed.onRdioReady);
})();
