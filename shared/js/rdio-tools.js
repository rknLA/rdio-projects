/*globals R, $, Replaylist */
(function()  {
  var _nc = window.RdioTools;

  window.RdioTools = {
    noConflict: _nc,

    authentication: {
      init: function(successCallback) {
        var self = window.RdioTools.authentication;
        var authSection = document.querySelector('[data-r-auth]');
        var paramStr = authSection.getAttribute('data-r-auth');

        if (paramStr == "userBadge") {
          // display the templated user badge.
          // TODO move the template outside of the index file.
          if (R.authenticated()) {
            self.renderUser($(authSection), successCallback);
          } else {
            self.renderLogin($(authSection), successCallback);
          }
        } else {
          console.log('an auth section doesn\'t exist or it has an unsupported value');
        }
      },
      
      renderUser: function(targetElement, callback) {
        var source = $('#authTemplate').html();
        var template = Handlebars.compile(source);
        var currentUserInfo = template({
          avatarUrl: R.currentUser.get('icon'),
          userName: R.currentUser.get('vanityName')
        });
        targetElement.empty()
          .append(currentUserInfo);
        callback();
      },

      renderLogin: (function() {
        /* This handles the login flow inside a closure.
         * Cause closures are fun.
         * */
        var loginShowing = false;

        var authButton;
        var authSectionElement;

        var successCallback;

        var loginPressed = function() {
          console.log("you hit the authentication button");
          authButton.html('Authenticating').attr('disabled', 'disabled');
          R.authenticate(authenticationComplete);
        };

        var authenticationComplete = function(success) {
          if (success) {
            console.log("authentication successful!");
            RdioTools.authentication.renderUser(authSectionElement, successCallback);
          } else {
            console.log("authentication failed");
            authButton.html('Authenticate').removeAttr('disabled');
          }
        };

        return function(targetElement, callback) {
          if (!loginShowing) {
            console.log("Should show an authorize button now.");
            successCallback = callback;
            authSectionElement = targetElement;
            targetElement.append('<button id="authenticationButton">Authenticate</button>');
            authButton = $('#authenticationButton');
            authButton.click(loginPressed);

            loginShowing = true;
          } else {
            console.log("Login is already showing! Do nothing.");
          }
        };
      })()
    }
  };
})();
