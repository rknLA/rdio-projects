Rdio Projects
-------------

A little framework for building client-side apps that use the Rdio API.

The framework's purpose is to maximize code reusability, and to shorten the
time from idea to prototype.

Each project lives in its own directory inside of `projects/` and can provide
its own set of HTML, CSS, and JS files.

Projects can also make use of shared HTML, CSS, and JS files, which live in
`shared/`.

Getting Started
===============

To get started on your own project, you'll want to fork this repo and duplicate
the `template` directory inside `projects` and rename it to something suitable
to your idea.

```bash
cp -r projects/template projects/replaylist
```

As you're developing your idea, you'll probably want to run a local server to
do some sanity checking and design verification.

To that end, the repo includes a little static node server.  Make sure you have
node installed, spin up the server, and have a poke at
[http://localhost:8000/](http://localhost:8000/)

```bash
node server.js
```

Deploying to Github Pages
=========================

The repo also includes a deploy script located at `bin/deploy` that will compile
all of your projects into a `gh-pages` branch and push them to your repo.

Simply running `./bin/deploy` should be enough, as long as you have all of the
dependencies installed.

  * Python 2.7 (accessible from `#!/usr/bin/env python`)
  * [GitPython](https://github.com/gitpython-developers/GitPython)

For now, you'll also need to make sure all of your working changes are committed,
or the deploy script will fail.
