/*globals R, $, Handlebars */

(function() {
  //no-conflict
  var _nc = window.FollaBack;

  window.FollaBack= {
    no_conflict: _nc,
    onRdioReady: function() {
      this.self = window.FollaBack;
      var self = this.self;
      RdioTools.authentication.init(self.onAuthenticated);
    }
  };

  R.ready(function(){
    console.log("Rdio is ready");

    // put post-rdio setup inside this function.
    // this is your entry point as long as main.js is sourced immediately after api.js
    FollaBack.onRdioReady();
  });
})();
