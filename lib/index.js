'use strict'

var express = require('express')

module.exports = function (app) {
  if (!app) app = express()

  app.get('/', function(req, res) {
    res.sendStatus(200)
  })

  require('./twitter')()
  require('./facebook')()
  require('./instagram')()

  if (process.env.PODCAST_URL) require('./podcast')(process.env.PODCAST_URL, 'podcast')
  setInterval(function() {
    if (process.env.PODCAST_URL) require('./podcast')(process.env.PODCAST_URL, 'podcast')
  }, 60 * 60 * 1e3)

  if (process.env.BLOG_URL) require('./feed')(process.env.BLOG_URL, 'blog')
  setInterval(function() {
    if (process.env.BLOG_URL) require('./feed')(process.env.BLOG_URL, 'blog')
  }, 60 * 60 * 1000)

  app.listen(process.env.PORT || 5000)
}
