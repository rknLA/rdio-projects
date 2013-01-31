/*globals R, $, Handlebars */

(function() {
  // do any pre-rdio setup you need to here.
  var _nc = window.MyRdioApp;
  window.MyRdioApp = {
    noConflict: _nc,

    onRdioReady: function() {
      var ready_div = document.createElement('div');
      var ready_text = document.createTextNode('Rdio is ready!');
      ready_div.appendChild(ready_text);
      document.getElementsByTagName('body')[0].appendChild(ready_div);
    }
  };

  R.ready(function(){
    console.log("Rdio is ready");

    // put post-rdio setup inside this function.
    // this is your entry point as long as main.js is sourced immediately after api.js
    window.MyRdioApp.onRdioReady();
  });
})();
