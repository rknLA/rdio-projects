/*globals R, $, FollaBack */
(function()  {
  FollaBack.onAuthenticated = function() {
    console.log('authentication!');

    FollaBack.renderFollowers();
  };

  FollaBack.followers = [];


  var gatherFollowers = function(user, offset, cb) {
    var count = 50;
    R.request({
      method: 'userFollowers',
      content: {
        user: user,
        start: offset,
        count: count,
        extras: '-*,key,username,url',
        v: 20140424
      },
      success: function(res) {
        var returnCount = res.result.items.length;
        var nextOffset = offset + returnCount + 1;

        FollaBack.followers = FollaBack.followers.concat(res.result.items);

        if (nextOffset < res.result.total) {
          gatherFollowers(user, nextOffset, cb);
        } else {
          cb(FollaBack.followers);
        }
      }
    });
  };

  FollaBack.renderFollowers = function() {
    var start = 0;
    var userKey = R.currentUser.get('key');

    gatherFollowers(userKey, start, function(followers) {
      console.log(followers);
      FollaBack.drawFollowers(followers);
    });
  };

  FollaBack.drawFollowers = function(followers) {
    var followersSection = $('section.ui :first');
    followersSection.removeClass('hidden');
    $('.follow-button').click(FollaBack.handleFollowEvent);

    var destination = $('ul.followers :first');

    var followerSource = $('#followerTemplate').html();
    var followerTemplate = Handlebars.compile(followerSource);
    $.each(followers, function(i, follower) {
      destination.append(followerTemplate(follower));
    });
  };

  FollaBack.handleFollowEvent = function(e) {
    $(e.target).prop('disabled', true);
    var totalFollowersCount = FollaBack.followers.length;
    var usersFollowed = 0;
    var errors = 0;

    var successfulFollows = [];
    var errorFollows = [];

    var onComplete = function() {
      if (usersFollowed + errors < totalFollowersCount) {
        // not yet complete
        return;
      }

      var successSource = $('#successfulText').html();
      var successTemplate = Handlebars.compile(successSource);

      var errorSource = $('#errorText').html();
      var errorTemplate = Handlebars.compile(errorSource);

      var section = $('section.ui :first');

      if (errors !== 0) {
        var errorAlert = errorTemplate({errors: errors});
        section.prepend(errorAlert);
      }

      if (usersFollowed !== 0) {
        var successAlert = successTemplate({followed: usersFollowed});
        section.prepend(successAlert);
      }

      if (errors === 0 && usersFollowed === 0) {
        alert("Something's gone wrong with the Rdio API");
      }
    };

    _.each(FollaBack.followers, function(el, ix, list) {
      R.request({
        method: 'addFriend',
        content: {
          user: el.key
        },
        success: function(res) {
          if (res.result === true) {
            usersFollowed += 1;
            successfulFollows.push(el);
            onComplete();
          } else {
            errors += 1;
            errorFollows.push(el);
            onComplete();
          }
        },
        error: function(err) {
          errors += 1;
          errorFollows.push(el);
          onComplete();
        }
      });
    });
  };

})();
