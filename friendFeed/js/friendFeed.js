/*globals R, $ */
(function() {
  //noConflict
  var oldFriendHistory = window.rdioFriendFeed;

  /* FriendFeed log! */
  var log = function(text) {
    console.log("[FriendFeed] " + text);
  };


  /* This handles the login flow inside a closure.
   * Cause closures are fun.
   * */
  var showLogin = (function() {
    var loginShowing = false;

    var loginPressed = function() {
      log("you hit the authentication button");
      $('#authenticationButton').html('Authenticating')
        .attr('disabled', 'disabled');
      R.authenticate(authenticationComplete);
    };

    var authenticationComplete = function(success) {
      if (success) {
        log("authentication successful!");
      } else {
        log("authentication failed");
      }
    };

    return function() {
      if (!loginShowing) {
        log("Should show an authorize button now.");
        $('#notice')
          .append('<button id="authenticationButton">Authenticate</button>');
        $('#authenticationButton').click(loginPressed);
        loginShowing = true;
      } else {
        log("Login is already showing! Do nothing.");
      }
    };
  })();

  window.rdioFriendFeed = {
    noConflict: oldFriendHistory,

    onRdioReady: function() {
      log("Rdio is ready!");
      var user = R.currentUser.vanityName;
      var logStr = "Viewing as " + user + " ";
      if (R.authenticated()) {
        log(logStr + "and also authenticated");
      } else {
        log(logStr + "but not authenticated");
        showLogin();
      }
    },

    onPubSub: function() {
    },
  }

  R.ready(rdioFriendFeed.onRdioReady);
})();
