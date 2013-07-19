/*globals R, $, Handlebars, Keen */
(function() {
  /* log! */
  var log = function(text) {
    console.log("[Voter] " + text);
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
        initializeVoter();
      } else {
        log("authentication failed");
        $('#authenticationButton').html('Authenticate')
          .removeAttr('disabled');
      }
    };

    return function() {
      if (!loginShowing) {
        log("Should show an authorize button now.");
        $('.loading')
          .append('<button id="authenticationButton">Authenticate</button>');
        $('#authenticationButton').click(loginPressed);
        loginShowing = true;
      } else {
        log("Login is already showing! Do nothing.");
      }
    };
  })();

  var initializeVoter = function() {
    $('.loading').empty().hide();
    var source = $('#userIdentityTemplate').html();
    var template = Handlebars.compile(source);
    var currentUserInfo = template({
      avatarUrl: R.currentUser.get('icon'),
      userName: R.currentUser.get('vanityName')
    });
    $('#you').empty()
      .append(currentUserInfo);
    setupPlaystate();
  };

  /* This should only get called after we've authenticated
   * and have a current User.  Right now, that means it's
   * only called from initializeVoter.
   */
  var setupPlaystate = function() {
    R.player.on("change:playingTrack", playerTrackDidChange);
    R.player.on("change:playingSource", playerSourceDidChange);
    R.player.on("change:playState", playstateDidChange);

    //kick playstateDidChange on load
    playstateDidChange(R.player.playState());
    playerSourceDidChange(R.player.playingSource());
    playerTrackDidChange(R.player.playingTrack());

    // setup pivot button
    $('#pivot').on('click', handlePivotPressed);
  };

  var playerPositionDidChange = function (newValue) {
    log('playerPositionDidChange ');
    console.log(newValue);
  };

  var playerTrackDidChange = function (newValue) {
    log('player track did change', newValue);
    updatePlayerInfo(newValue);
    Keen.addEvent("trackChanged", {
      userKey: R.currentUser.get('key'),
      username: R.currentUser.get('vanityName'),
      stationKey: station,
      stationName: R.player.playingSource().get('name'),
      trackKey: newValue.get('key'),
      trackName: newValue.get('name')
    });
  };
  
  var enableControls = function() {
    $('#killdoze').removeAttr('disabled');
    $('#downvote').removeAttr('disabled');
    $('#upboat').removeAttr('disabled');
  };

  var disableControls = function() {
    $('#killdoze').attr('disabled', 'disabled');
    $('#downvote').attr('disabled', 'disabled');
    $('#upboat').attr('disabled', 'disabled');
  };

  var handleVote = function(vote) {
    return function (e) {
      e.preventDefault();

      // disable buttons, only boat once
      disableControls();
      $('#vote-results').empty().append('Voting...');

      var station = R.player.playingSource().get('key');
      var track = R.player.playingTrack().get('key');

      Keen.addEvent("vote", {
        userKey: R.currentUser.get('key'),
        username: R.currentUser.get('vanityName'),
        stationKey: station,
        stationName: R.player.playingSource().get('name'),
        trackKey: track,
        trackName: R.player.playingTrack().get('name'),
        vote: vote
      });
      
      R.request({
        method: "voteForTrackOnStation",
        content: {
          'station_key': station,
          'track_key': track,
          'vote': vote
        },
        success: function (response) {
          console.log(response);
          $('#vote-results').empty().append('Voted!');
          if (vote != 'favorite') {
            R.player.next();
          }
        },
        error: function (response) {
          console.error(response);
          $('#vote-results').empty().append('An error happend, couldn\'t vote!');
          enableControls();
        }
      });
    };
  };

  var handlePivotPressed = function(e) {
    //should probably disable the button until the new station's started playing
    var currentTrackKey = R.player.playingTrack().get('key');

    console.log("pivot on track " + currentTrackKey);

    // this is quick and dirty. track keys are 't' followed by an int.
    // just remove the t and add "sr"
    var newStationKey = 'sr' + currentTrackKey.slice(1);

    // and add the adventurousness
    var adventurousness = $('input:checked').val();

    newStationKey += "|" + adventurousness;

    Keen.addEvent("pivot", {
      userKey: R.currentUser.get('key'),
      username: R.currentUser.get('vanityName'),
      newStationKey: station,
      oldStationKey: R.player.playingSource().get('key'),
      oldStationName: R.player.playingSource().get('name'),
      pivotTrackKey: track,
      pivotTrackName: R.player.playingTrack().get('name')
    });

    console.log("changing playing source to " + newStationKey);
    R.player.play({source: newStationKey});
  };

  var playerSourceDidChange = function(newValue) {
    log('playerSourceDidChange ');
    console.log(newValue);

    $('#killdoze').off();
    $('#downvote').off();
    $('#upboat').off();
    $('.adventurousness').off();

    var newSourceType;
    if (newValue && newValue.get && typeof(newValue.get) === 'function') {
      newSourceType = newValue.get('type');
    } else {
      $('#controls').addClass('hidden');
      return;
    }

    Keen.addEvent("playSourceChanged", {
      userKey: R.currentUser.get('key'),
      username: R.currentUser.get('vanityName'),
      newSourceName: newValue.get('name'),
      newSourceKey: newValue.get('key'),
      previousSourceKey: R.player.playingSource().get('key'),
      previousSourceName: R.player.playingSource().get('name'),
    });

    if (newSourceType == 'tp' ||
        newSourceType == 'rr' ||
        newSourceType == 'sr') {
      // this is a bit redundant right now, since .get is only available on these types...

      // source is an echonest station, and can be voted.
      $('#killdoze').on('click', handleVote('skip'));
      $('#downvote').on('click', handleVote('ban'));
      $('#upboat').on('click', handleVote('favorite'));
      enableControls();

      $('#station .name').text(newValue.get('name'));

      var key = newValue.get('key');
      var keyParts = key.split('|');
      var rawKey = keyParts[0];
      var preset = keyParts[1] || '3';
      
      $('.adventurousness input[value="' + preset + '"]')
        .prop('checked', true);

      $('.adventurousness').on('change', 'input', function(event) {
        var val = $(event.target).val();

        Keen.addEvent("adventurousnessEvent", {
          userKey: R.currentUser.get('key'),
          username: R.currentUser.get('vanityName'),
          currentSource: R.player.playingSource().get('key'),
          sourceKey: rawKey,
          adventurousness: val
        });

        R.player.play({ source: rawKey + '|' + val });
      });

      $('#controls').removeClass('hidden');
      $('#station').removeClass('hidden');
    } else {
      $('#station').addClass('hidden');      
    }
  };

  var playstateDidChange = function(newValue) {
    log('Playstate changed to ' + newValue);
    if (newValue == R.player.PLAYSTATE_PLAYING) {
      $('#playstate').empty().append('Playing');
      var currentTrack = R.player.playingTrack();
      updatePlayerInfo(currentTrack);
      $('#player-info').show();
    } else {
      $('#playstate').empty().append('Paused');
      $('#player-info').hide();
    }
  };

  var updatePlayerInfo = function (newInfo) {
    var container = $('#current-track');
    $('.track-name:first', container).empty()
      .append(newInfo.get('name'));
    $('.artist:first', container).empty()
      .append(newInfo.get('artist'));
    $('.album:first', container).empty()
      .append(newInfo.get('album'));
    $('#vote-results').empty();
  };


  //noConflict
  var oldVoter = window.rdioVoter;

  window.rdioVoter = {
    noConflict: oldVoter,

    onRdioReady: function() {
      log("Rdio is ready!");
      var user = R.currentUser.vanityName;
      var logStr = "Viewing as " + user + " ";
      if (R.authenticated()) {
        log(logStr + "and also authenticated");
        initializeVoter();
      } else {
        log(logStr + "but not authenticated");
        showLogin();
      }
    }
  };

  R.ready(rdioVoter.onRdioReady);
})();
