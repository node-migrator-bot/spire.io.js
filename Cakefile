option '-p', '--port [PORT]', 'Test server\'s port, defaults to 8080.'
option '-h', '--host [HOST]', 'Test server\'s ip/host to listen on. set to 0.0.0.0 for all interfaces.  defaults to localhost.'
option '-k', '--api-key [KEY]', 'The API key to use'
option '-u', '--api-url [URL]',  'The API url to use'
option '-f', '--files [FILES]', 'Comma separated list of test files to run (no spaces!), defaults to all of them'

task 'test:server', 'launch a server for the browser tests', (o)->
  path = require 'path'
  {exec} = require 'child_process'
  express = require 'express'
  app = express.createServer()
  testDir = path.join __dirname, 'test'
  src = path.join __dirname, 'jquery.spire.js'
  sha = undefined
  link = undefined
  http = require 'http'
  gitio = require 'gitio'

  o.port = o.port || 8080
  o.host = o.host || 'localhost'
  o['api-key'] = o['api-key'] || 'c9KfjaIirRlg9YKpCck97Q'
  o['api-url'] = o['api-url'] || 'http://api.spire.io'
  o.files = o.files || 'test/specs.js'

  tests = o.files.split(',')

  tests.forEach (file, index, collection)->
    file = file.replace(/(.*test\/)/, '')
    collection[index] = '<script src="specs.js">' + file + '</script>'

  app.configure ->
    app.use express.logger 'dev'
    app.use express.static testDir

  app.get '/jquery.spire.js', (req, res)->
    res.header 'Content-Type', 'text/javascript'
    res.sendfile src

  app.get '/', (req, res)->
    index = [
      '<html>'
      '<head>'
      '  <title>jquery.spire.js | specs</title>'
      '  <link rel="shortcut icon"'
      '    type="image/png" href="jasmine/favicon.png" />'
      '  <link href="jasmine/jasmine.css" rel="stylesheet"/>'
      '  <script src="jasmine/jasmine.js"></script>'
      '  <script src="jasmine/jasmine-html.js"></script>'
      '  <script src="sinon.js"></script>'
      '  <script src="jasmine-sinon.js"></script>'
      ''
      '  <script src="http://code.jquery.com/jquery-1.6.4.min.js"></script>'
      '  <script src="jquery.spire.js"></script>'
      '  <script src="specs.js"></script>'
      '</head>'
      ''
      '<body>'
      '  <p>'
      '    sha: ' + sha + ' //=> <a href="' + link + '">' + link + '</a>'
      '  </p>'
      '  <script type="text/javascript">'
      '    var jasmineEnv = jasmine.getEnv();'
      '    jasmineEnv.reporter = new jasmine.TrivialReporter();'
      '    jasmineEnv.execute();'
      '  </script>'
      '</body>'
      '</html>'
    ].join '\n'
    res.header 'Content-Type', 'text/html'
    res.send(index);

  exec 'git rev-parse --verify HEAD', (err, stdout, stderr)->
    sha = stdout.replace('\n', '')
    shorten = 'https://github.com/spire-io/jquery.spire.js/commit/' + sha
    gitio shorten, (err, res)->
      throw err if err
      link = res
      app.listen o.port, o.host, ->
        process.stdout.write 'Test server running:\n'
        process.stdout.write '  => http://' + o.host + ':' + o.port
        process.stdout.write '\n'

task 'bundle', 'create the minified version of jquery.spire.js', (o)->
  fs = require 'fs'
  uglify = require 'uglify-js'

  fs.readFile 'jquery.spire.js', 'utf8', (err, data)->
    throw err if err


    out = uglify data

    fs.writeFile 'jquery.spire.min.js', out, (err)->
      throw err if err

task 'docs', 'generate the inline documentation', ->
  fs = require 'fs'
  {spawn, exec} = require 'child_process'
  command = [
    'rm -r docs/*.html'
    'node_modules/docco/bin/docco jquery.spire.js'
  ].join(' && ')
  exec command, (err) ->
    throw err if err
    # move to the index
    fs.rename 'docs/jquery.spire.html', 'docs/index.html', (err)->

# Adapted from http://bit.ly/v02mG8
task 'docs:pages', 'Update gh-pages branch', ->
  path = require 'path'
  cwd = process.cwd()
  {exec} = require 'child_process'
  commitDocs = ->
    process.chdir cwd
    exec 'git rev-parse --short HEAD', (err, stdout, stderr)->
      throw err if err
      revision = stdout
      process.chdir 'docs'
      exec 'git add *.html', (err, stdout, stderr)->
        process.stdout.write stdout
        process.stderr.write stderr
        throw err if err
        commit = "git commit -m 'rebuild pages from " + revision + "'"
        exec commit, (err, stdout, stderr)->
          process.stdout.write stdout
          process.stderr.write stderr
          if !err # its possible to get a benign 'nothing to commit' err
            exec 'git push -q o HEAD:gh-pages', (err, stdout, stderr)->
              process.stdout.write stdout
              process.stderr.write stderr
              throw err if err
              process.chdir cwd
  path.exists 'docs/.git', (exists)->
    if exists
      commitDocs()
    else
      process.chdir 'docs'
      exec 'git init && git remote add o ../.git', (err, stdout, stderr)->
        process.stdout.write stdout
        process.stderr.write stderr
        throw err if err
        command = 'git fetch o && git reset --hard o/gh-pages && touch .'
        exec command, (err, stdout, stderr)->
          process.stderr.write stderr
          throw err if err
          commitDocs()
