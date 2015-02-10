'use strict'

var request = require('request')
var FeedParser = require('feedparser')

var exports = module.exports = function crawl(url, provider, db) {
  var feedparser = new FeedParser({
    feedurl: url,
    resume_saxerror: true
  })
  var req = request(url)
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
      items.push(createPayload(item, provider))
    }
    return db.save(items, function (err, res) {
      console.log(res)
      console.log('FEED ' + provider + ': ' + (err ? err : 'db updated'))
    })
  })
}

function createPayload (data, provider) {
  var date = data.pubDate || data.pubdate
  date = new Date(date).toISOString()
  var id = date + '-' + provider + '-' + data.guid

  return {
    _id: id,
    provider: provider,
    data: data
  }
}
