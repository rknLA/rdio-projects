/*globals R, $, Handlebars */

(function() {
  /* log! */
  var log = function(text) {
    console.log("[Lyrio] " + text);
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
      R.authenticate({
        complete: authenticationComplete,
        mode: 'redirect'
      });
    };

    var authenticationComplete = function(success) {
      if (success) {
        log("authentication successful!");
        var authLog = {
          key: R.currentUser.get('key'),
          username: R.currentUser.get('vanityName'),
        };
        Keen.addEvent("authorization", authLog);
        initializeAfterLogin();
      } else {
        log("authentication failed");
        $('#authenticationButton').html('Authenticate')
          .removeAttr('disabled');
      }
    };

    return function() {
      if (!loginShowing) {
        log("Should show an authorize button now.");
        $('.lyrio_loading')
          .append('<button id="authenticationButton">Authenticate</button>');
        $('#authenticationButton').click(loginPressed);
        loginShowing = true;
      } else {
        log("Login is already showing! Do nothing.");
      }
    };
  })();

  var initializeAfterLogin = function() {
    $('.lyrio_loading').empty().hide();
    var source = $('#userIdentityTemplate').html();
    var template = Handlebars.compile(source);
    var currentUserInfo = template({
      avatarUrl: R.currentUser.get('icon'),
      userName: R.currentUser.get('vanityName')
    });
    $('.lyrio_you').empty()
      .append(currentUserInfo);

  };


  // do any pre-rdio setup you need to here.
  var oldLyrio = window.Lyrio;

  window.Lyrio = {
    noConflict: oldLyrio,

    onRdioReady: function() {
      log("Rdio is ready!");
      var user = R.currentUser.vanityName;
      var logStr = "Viewing as " + user + " ";
      if (R.authenticated()) {
        log(logStr + "and also authenticated");
        initializeAfterLogin();
      } else {
        log(logStr + "but not authenticated");
        showLogin();
      }
    }
  };

  R.ready(Lyrio.onRdioReady);
})();
