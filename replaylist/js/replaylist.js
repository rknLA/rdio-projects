/*globals R, $, Replaylist */
(function()  {

  Replaylist.onAuthenticated = function() {
    console.log('authentication!');

    Replaylist.renderForm();
    Replaylist.renderPlaylist();
  };

  Replaylist.handleSearchEvent = function(e) {
    e.preventDefault();
    var q = $('#playlist_search_input').val();
    Replaylist.searchForPlaylist(q);
  };

  Replaylist.searchForPlaylist = function(query) {
    console.log('should search for ' + query);
    R.request({
      method: 'getObjectFromUrl',
      content: {
        url: query,
        extras: 'tracks'
      },
      success: function(res) {
        console.log('got an object from rdio!');
        console.log(res);
        var urlType = res.result.type;
        if (urlType == 'p') {
          Replaylist.renderPlaylist(res.result);
        } else {
          console.error('You submitted a url that\'s not a playlist');
        }
      },
      error: function(res) {
        console.log('error getting object from url');
        console.log(res);
      }
    });
  };

  Replaylist.renderForm = function() {
    var ui = $('section.ui :first');

    var source = $('#playlistSearchTemplate').html();
    ui.empty().append(Handlebars.compile(source)());
    $('#playlist_search_button').click(Replaylist.handleSearchEvent);
  };

  Replaylist.renderPlaylist = function(playlist) {
    var playlistSection = $('section.sourcePlaylist :first');

    if (playlist === undefined) {
      playlistSection.empty();
      return;
    }
    console.log(playlist);

    var playlistSource = $('#playlistTemplate').html();
    var playlistTemplate = Handlebars.compile(playlistSource);
    var playlistContents = playlistTemplate(playlist);
    playlistSection.empty().append(playlistContents);

    var playlistOL = $('.playlist-tracks :first').children('ol');

    var trackSource = $('#playlistTrackTemplate').html();
    var trackTemplate = Handlebars.compile(trackSource);
    $.each(playlist.tracks, function(i, track) {
      console.log(i, track);
      playlistOL.append(trackTemplate(track));
    });
  };
})();
