Rdio Station Voter
------------------

This project is mostly for internal use to provide us with a little bit of rough UI to test out some station features.

If you don't work at Rdio and you're reading this, you're welcome to have a look around, but there isn't much to see here.


Running against dev
===================

So you want to run the voter against your local dev Rdio?

Make sure you have node.js installed, then follow these instructions:

* Have a look at [line 11](https://github.com/rknLA/rdio-projects/blob/gh-pages/voter/index.html#L11) in the index.html file.
  This is where the JS API is included.  Right under it is the same link, but with a `localhost` root instead of rdio.com.
* Comment out the rdio.com url and uncomment the rdio.localhost url
* Repeat the above two steps in the `helper.html` file.
* Spin up your localhost rdio
* In another terminal, `cd` into this repo's root and run `node server.js`
* Visit `http://localhost:8888/voter/index.html` in your browser
* Celebrate!
