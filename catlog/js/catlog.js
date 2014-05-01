/*globals R, $, CatLog */
(function()  {
  CatLog.onAuthenticated = function() {
    console.log('authentication!');

    CatLog.renderForm();
    CatLog.renderLabel();
  };


  CatLog.labelInfo = {};
  CatLog.labelAlbums = [];

  CatLog.handleSearchEvent = function(e) {
    e.preventDefault();
    var q = $('.label_search_input :first').val();
    CatLog.searchForLabel(q);
  };

  CatLog.searchForLabel = function(query) {
    this.labelInfo = {};
    this.labelAlbums = [];
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
          CatLog.renderLabel(CatLog.labelInfo, CatLog.labelAlbums);
        }
      }
    });
  };

  var addAlbums = function(albums) {
    var albumKeys = [];
    _.each(albums, function(el, ix, list) {
      albumKeys.push(el.key);
    });

    console.log(albumKeys.join(','));

    R.request({
      method: 'addToCollection',
      content: {
        keys: albumKeys.join(','),
      },
      success: function(res) {
        alert("succeeded in adding to your collection");
      },
      error: function(res) {
        alert("error adding to your collection!");
      }
    });
  };

  CatLog.renderLabel = function(info, albums) {
    console.log("Rendering info: ", CatLog.labelInfo, CatLog.labelAlbums);
    var labelSection = $('section.sourceLabel :first');

    if (info === undefined) {
      labelSection.empty();
      return;
    }

    info.albumCount = albums.length;

    var labelInfoSource = $('#labelInfoTemplate').html();
    var labelInfoTemplate = Handlebars.compile(labelInfoSource);
    var labelInfoContents = labelInfoTemplate(info);
    labelSection.empty().append(labelInfoContents);

    $('.add_albums_button').click(function() {
      addAlbums(albums);
    });
  };

  CatLog.renderForm = function() {
    var ui = $('section.ui :first');

    var source = $('#labelSearchTemplate').html();
    ui.empty().append(Handlebars.compile(source)());
    $('.label_search_button :first').click(CatLog.handleSearchEvent);
    $('.clone-results :first').fadeOut();
  };
})();
