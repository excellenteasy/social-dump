'use strict'

var request = require('request')
var pickup = require('pickup')

var db = require('./db')

var entries = []

var exports = module.exports = function crawl () {

  request(process.env.PODCAST_URL).pipe(pickup({eventMode: true}))

  .on('entry', entries.push.bind(entries))

  // Usually feed is the last event in the stream
  // If not entries remain in memory and get pushed to the db in the next run
  .on('feed', function(feed) {
    db.save(entries.map(exports.createPayload), function(err, res) {
      console.log(arguments)
      entries = []
    })
  })

  setTimeout(crawl, 60 * 60 * 1e3)
}

exports.createPayload = function (entry) {
  var date = new Date(entry.updated).toISOString()
  var id = date + '-podcast-' + entry.id

  return {
    _id: id,
    provider: 'podcast',
    data: entry
  }
}
