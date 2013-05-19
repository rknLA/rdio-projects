/*globals R, $, Handlebars */

(function() {
  // do any pre-rdio setup you need to here.
  var _nc = window.MyRdioApp;
  window.Claudio= {
    noConflict: _nc,
    
    _connectRdioButton: null,
    _connectSoundcloudButton: null,

    onRdioReady: function() {
      var self = this;
      $('.loading').hide();

      this._connectRdioButton = $('.connect_button.rdio');
      this._connectRdioButton.click(function() {
        R.authenticate(self.onRdioAuthenticated);
      });
      this._connectSoundcloudButton = $('.connect_button.soundcloud');

      if (R.authenticated()) {
        this.onRdioAuthenticated(true);
      } else {
        this._connectRdioButton.show();
      }
    },

    onRdioAuthenticated: function(success) {
      var self = window.Claudio;
      if (success) {
        self.rdioConnected = true;
        self._connectRdioButton.hide();
        self.setupSoundcloud();
      }
    },

    setupSoundcloud: function() {
      SC.initialize({
        client_id: 'f91b39247fdbb16f83ce9ca8780898c8',
        redirect_uri: 'http://localhost:8888/claudio/callback.html'
      });
      this._connectSoundcloudButton.show().click(this.onSoundcloudConnectClicked);
    },

    onSoundcloudConnectClicked: function() {
      SC.connect(window.Claudio.authProcessesCompleted);
    },

    authProcessesCompleted: function() {
      var self = window.Claudio;
      self._connectSoundcloudButton.hide();
      self.findRecommendations();
    },

    findRecommendations: function() {
      var scFollowing = $('.soundcloud.following ul');
      SC.get('/me/followings', function(users) {
        var i;
        var userElSrc = $('#soundcloudUserTemplate').html();
        var userTemplate = Handlebars.compile(userElSrc);
        for (i = 0; i < users.length; ++i) {
          var user = users[i];
          var userEl = userTemplate(user);
          scFollowing.append(userEl);
        }
        $('.soundcloud_username').click(function(e) {
          console.log(e.target);
        });
      });
    }
  };

  $('document').ready(function() {
    R.ready(function(){
      window.Claudio.onRdioReady();
    });
  });
})();
