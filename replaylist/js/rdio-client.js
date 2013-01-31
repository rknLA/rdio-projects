/*globals R, $, Replaylist */
(function()  {
  var _nc = window.RC;
  window.RC = {
    noConflict: _nc,

    authentication: {
      init: function(authenticated_callback) {
        var self = window.RC.authentication;
        var authSection = document.querySelector('[data-r-auth]');
        var paramStr = authSection.getAttribute('data-r-auth');

        if (paramStr == "userBadge") {
          // display the templated user badge.
          // TODO move the template outside of the index file.
          if (R.authenticated()) {
            self.renderUser($(authSection));
          } else {
            self.renderLogin($(authSection));
          }
        } else {
          console.log('an auth section doesn\'t exist or it has an unsupported value');
        }
      },
      
      renderUser: function(targetElement) {
        var source = $('#authTemplate').html();
        var template = Handlebars.compile(source);
        var currentUserInfo = template({
          avatarUrl: R.currentUser.get('icon'),
          userName: R.currentUser.get('vanityName')
        });
        targetElement.empty()
          .append(currentUserInfo);
      },

      renderLogin: (function() {
        /* This handles the login flow inside a closure.
         * Cause closures are fun.
         * */
        var loginShowing = false;

        var authButton;
        var authSectionElement;

        var loginPressed = function() {
          console.log("you hit the authentication button");
          authButton.html('Authenticating').attr('disabled', 'disabled');
          R.authenticate(authenticationComplete);
        };

        var authenticationComplete = function(success) {
          if (success) {
            console.log("authentication successful!");
            self.renderUser(authSectionElement);
          } else {
            console.log("authentication failed");
            authButton.html('Authenticate').removeAttr('disabled');
          }
        };

        return function(targetElement) {
          if (!loginShowing) {
            console.log("Should show an authorize button now.");
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
