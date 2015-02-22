'use strict'

var express = require('express')
var cors = require('cors')

module.exports = function (app, options) {
  if (!app) app = express()
  if (!options) options = process.env

  require('./db')(options)

  .then(function (db) {
    app.get('/dbdump', cors({
      credentials: true,
      origin: function(origin, callback) {
        // see https://github.com/pouchdb/pouchdb/issues/896#issuecomment-22389056
        callback(null, true)
      }
    }), function(req, res) {
      db.dump(res)
    })

    if (options.TWITTER_CONSUMER_KEY) {
      console.log('Starting to crawl twitter')
      require('./twitter')(options, db)
    }

    if (options.INSTAGRAM_ACCESS_TOKEN) {
      console.log('Starting to crawl instagram')
      require('./instagram')(options, db)
    }

    if (options.FACEBOOK_CLIENT_ID) {
      console.log('Starting to crawl facebook')
      repeat(require('./facebook').bind(null, options, db))
    }

    if (options.PODCAST_URL) {
      console.log('Starting to crawl podcast')
      repeat(require('./podcast').bind(null, options.PODCAST_URL, 'podcast', db))
    }

    if (options.BLOG_URL) {
      console.log('Starting to crawl feed')
      repeat(require('./feed').bind(null, options.BLOG_URL, 'blog', db))
    }
  })

  app.get('/', function(req, res) {
    res.sendStatus(200)
  })

  app.listen(options.PORT || 5000)
}

function repeat (fn, interval) {
  interval = interval || 6e4
  fn()
  return setInterval(fn, interval)
}
