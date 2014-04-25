/*globals R, $, CatLog */
(function()  {

  CatLog.currentPlaylist = null;

  CatLog.userPlaylists = [];

  CatLog.onAuthenticated = function() {
    console.log('authentication!');

    CatLog.renderForm();
    CatLog.renderPlaylist();

    R.ready(function() {
      R.request({
        method: 'getPlaylists',
        content: {
          extras: '-*,name,key,length'
        },
        success: function(res) {
          CatLog.userPlaylists = res.result.owned;
        },
        error: function(err) {
          console.log("failed to grab user playlists");
          console.log(err);
        }
      });
    });
  };


  CatLog.labelInfo = {};
  CatLog.labelAlbums = [];

  CatLog.handleSearchEvent = function(e) {
    e.preventDefault();
    var q = $('.label_search_input :first').val();
    CatLog.searchForLabel(q);
  };

  CatLog.searchForLabel = function(query) {
    console.log('should search for ' + query);
    R.request({
      method: 'getObjectFromUrl',
      content: {
        url: query
      },
      success: function(res) {
        console.log('got an object from rdio!');
        console.log(res);
        var urlType = res.result.type;
        if (urlType == 'l') {
          console.log("should render prelim label data here...");
          CatLog.labelInfo = res.result;
          CatLog.populateAlbumsForLabel(res.result.key, 0);
        } else {
          console.error('You submitted a url that\'s not a label');
        }
      },
      error: function(res) {
        console.log('error getting object from url');
        console.log(res);
      }
    });
  };

  CatLog.populateAlbumsForLabel = function(labelKey, offset) {
    var count = 50;
    R.request({
      method: 'getAlbumsForLabel',
      content: {
        label: labelKey,
        start: offset,
        count: count,
        v: 20140424,
        extras: '-*,key,name,icon'
      },
      success: function(res) {
        var returnCount = res.result.items.length;
        var nextOffset = offset + returnCount + 1;

        CatLog.labelAlbums = CatLog.labelAlbums.concat(res.result.items);

        if (nextOffset < res.result.total) {
          CatLog.populateAlbumsForLabel(labelKey, nextOffset);
        } else {
          console.log("Got label info: ", CatLog.labelInfo, CatLog.labelAlbums);
        }
      }
    });
  };

  var cloneSuccessful = function(res) {
    console.log('playlist cloned!');

    CatLog.renderPlaylist();
    $('.label_search_input :first').val('');

    var text = '<h3>Cloned successfuly!</h3>';
    $('.clone-results :first').html(text).fadeIn(200).fadeOut(3000);
  };

  CatLog.handleCloneClicked = function(e) {
    console.log('clone clicked!');

    // prepare the track keys
    var pl = CatLog.currentPlaylist;
    var trackKeysArray = [];

    $.each(pl.tracks, function(ix, track) {
      trackKeysArray[ix] = track.key;
    });
    var tracksKeys = trackKeysArray.join(',');

    var destination = $('.playlist-destination-selector').val();

    if (destination == "new") {
      R.request({
        method: 'createPlaylist',
        content: {
          name: pl.name,
          description: pl.description,
          tracks: tracksKeys
        },
        success: cloneSuccessful,
        error: function(res) {
          console.log('error cloning playlist');
          console.log(res);
          var text = "Error! ";
          text += res.message;
          $('.clone-results :first').html(text).show(400);
        }
      });
    } else {
      // destination is a playlist
      // clear the existing one
      var length = $('.existing_playlist[value=' + destination + ']').first().data().rPlaylistLength;

      var addNewTracks = function() {
        R.request({
          method: 'addToPlaylist',
          content: {
            playlist: destination,
            tracks: tracksKeys
          },
          success: cloneSuccessful,
          error: function(res) {
            console.log('error updating existing playlist. well, this is bad');
            console.log(res);
          }
        });
      };

      var removeExistingTracks = function(tracksArray) {
        R.request({
          method: 'removeFromPlaylist',
          content: {
            playlist: destination,
            index: 0,
            count: length,
            tracks: tracksArray.join(',')
          },
          success: function(res) {
            addNewTracks();
          },
          error: function(res) {
            console.log("error removing tracks from existing playlist, bailing");
            console.log(res);
          }
        });
      };

      if (length > 0) {
        R.request({
          method: 'get',
          content: {
            keys: destination,
            extras: '-*,trackKeys'
          },
          success: function(res) {
            removeExistingTracks(res.result[destination].trackKeys);
          },
          error: function(res) {
            console.log("error getting tracks from existing playlist, bailing");
            console.log(res);
          }
        });
        
      } else {
        addNewTracks();
      }
    }
  };

  CatLog.renderForm = function() {
    var ui = $('section.ui :first');

    var source = $('#labelSearchTemplate').html();
    ui.empty().append(Handlebars.compile(source)());
    $('.label_search_button :first').click(CatLog.handleSearchEvent);
    $('.clone-results :first').fadeOut();
  };

  CatLog.renderPlaylist = function(playlist) {
    var playlistSection = $('section.sourcePlaylist :first');

    if (playlist === undefined) {
      playlistSection.empty();
      return;
    }
    console.log(playlist);

    CatLog.currentPlaylist = playlist;

    var playlistSource = $('#playlistTemplate').html();
    var playlistTemplate = Handlebars.compile(playlistSource);
    var playlistContents = playlistTemplate(playlist);
    playlistSection.empty().append(playlistContents);

    $('.clone_playlist :first').click(CatLog.handleCloneClicked);

    var playlistOL = $('.playlist-tracks :first').children('ol');

    var trackSource = $('#playlistTrackTemplate').html();
    var trackTemplate = Handlebars.compile(trackSource);
    $.each(playlist.tracks, function(i, track) {
      console.log(i, track);
      playlistOL.append(trackTemplate(track));
    });

    var destinationChoices = $('.playlist-destination-selector');

    var destinationItemSource = $('#playlistDestinationItemTemplate').html();
    var destinationItemTemplate = Handlebars.compile(destinationItemSource);
    $.each(CatLog.userPlaylists, function(i, pl) {
      console.log(i, pl);
      destinationChoices.append(destinationItemTemplate(pl));
    });
  };
})();
