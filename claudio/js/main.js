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
    }
  };

  var _sc_noconflict = window.MySoundcloudApp;
  window.MySoundcloudApp = {
    setup: function() {
    },

    onConnectClicked: function() {
      //
    }
    
  };

  $('document').ready(function() {
    R.ready(function(){
      window.Claudio.onRdioReady();
    });
  });
})();
