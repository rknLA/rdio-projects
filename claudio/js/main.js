/*globals R, $, Handlebars */

(function() {
  // do any pre-rdio setup you need to here.
  var _nc = window.MyRdioApp;
  window.MyRdioApp = {
    noConflict: _nc,

    onRdioReady: function() {
      var readyDiv = document.createElement('div');
      var readyText = document.createTextNode('Rdio is ready!');
      readyDiv.appendChild(readyText);
      document.getElementsByTagName('body')[0].appendChild(readyDiv);
    }
  };

  var _sc_noconflict = window.MySoundcloudApp;
  window.MySoundcloudApp = {
    setup: function() {
      SC.initialize({
        client_id: 'f91b39247fdbb16f83ce9ca8780898c8',
        redirect_uri: 'http://localhost:8888/claudio/callback.html'
      });

      var connectButton = document.createElement('button');
      var buttonText = document.createTextNode('Connect Soundcloud');
      connectButton.appendChild(buttonText);
      document.getElementsByTagName('body')[0].appendChild(connectButton);
      connectButton.onclick = this.onConnectClicked;
    },

    onConnectClicked: function() {
      //
      SC.connect(function() {
        SC.get('/me', function(me) { 
          console.log('Hello, ' + me.username); 
        });
      });
    }
    
  };

  R.ready(function(){
    window.MyRdioApp.onRdioReady();

    // initialize soundcloud after Rdio is ready so that we know document is also ready
    window.MySoundcloudApp.setup();
  });
})();
