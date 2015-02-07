'use strict'

var request = require('request')
var FeedParser = require('feedparser')
var db = require('./db')

var e = process.env

var exports = module.exports = function (provider) {
  var feedparser = new FeedParser({
    feedurl: e.FEED_URL,
    resume_saxerror: true
  })
  var req = request(e.FEED_URL)
  req.on('error', function (err) {
    console.log(err)
  })
  req.on('response', function (res) {
    var stream = this

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser)
  })

  feedparser.on('error', function(err) {
    console.log(err)
  })
  feedparser.on('readable', function() {
    var meta = this.meta
    var item
    var items = []

    while (item = this.read()) {
      console.log(item)
      item.meta = meta
      items.push(createPayload(item))
    }
    return db.save(items, function (err, res) {
      console.log(res)
      console.log('FEED ' + e.FEED_PROVIDER + ': ' + (err ? err : 'db updated'))
    })
  })
}

function createPayload (data) {
  var date = data.pubDate || data.pubdate
  date = new Date(date).toISOString()
  var id = date + '-e.FEED_PROVIDER-' + data.guid

  return {
    _id: id,
    provider: e.FEED_PROVIDER,
    data: data
  }
}
