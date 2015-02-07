'use strict'

var express = require('express')
var app = express()

app.get('/', function(req, res) {
  res.sendStatus(200)
})

require('./lib/twitter')()
require('./lib/facebook')()
require('./lib/instagram')()

if (process.env.PODCAST_URL) require('./lib/podcast')(process.env.PODCAST_URL, 'podcast')
setInterval(function() {
  if (process.env.PODCAST_URL) require('./lib/podcast')(process.env.PODCAST_URL, 'podcast')
}, 60 * 60 * 1e3)

if (process.env.BLOG_URL) require('./lib/feed')(process.env.BLOG_URL, 'blog')
setInterval(function() {
  if (process.env.BLOG_URL) require('./lib/feed')(process.env.BLOG_URL, 'blog')
}, 60 * 60 * 1000)

app.listen(process.env.PORT || 5000)
