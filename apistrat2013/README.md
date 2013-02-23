What's new in the Rdio API
--------------------------

This is the source code for my presentation from the 2013 API Strategy
Conference in NYC on February 21, 2013.

Visit [http://rknla.github.com/rdio-projects/apistrat2013/index.html](http://rknla.github.com/rdio-projects/apistrat2013/index.html) to view the
presentation.

The presentation has only been tested in Chrome, and is not particularly optimized for any other browsers.

Javascript Examples
===================

The [JS examples slide](http://rknla.github.com/rdio-projects/apistrat2013/index.html#/slide-some-examples)
listens for a ctrl+enter keypress to `eval` the javascript in the
`#js-example-code` element.

(Note that the console-swapper is only triggered on slide-change, so running the JS examples after
clicking the above link will send output to the actual browser console.  To fix this, toggle the
slides back and forth.)

Aside from the `<script ...>` tag that includes Rdio and the helper.html file,
there's no special magic here.  Load up the pages and try the examples yourself.

Have a look at our [developer documentation](http://developer.rdio.com) to find
other methods you can explore in place of `getTopCharts`

Forking
=======

You're invited to fork this project, but you won't be able to run the code as-is
on your own server or on localhost unless you use your own `client_id`.

Visit our [developer portal](http://dev-beta.rdio.com) to sign up for a JS API
client_id.
