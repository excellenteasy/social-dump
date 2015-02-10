'use strict'

var request = require('request')
var pickup = require('pickup')

var entries = []

var exports = module.exports = function (url, provider, db) {
  return request(url).pipe(pickup({eventMode: true}))

  .on('entry', entries.push.bind(entries))

  // Usually feed is the last event in the stream
  // If not entries remain in memory and get pushed to the db in the next run
  .on('feed', function(feed) {
    db.save(entries.map(exports.createPayload.bind(null, provider)), function(err, res) {
      console.log(err)
      entries = []
    })
  })
}

exports.createPayload = function (provider, entry) {
  var date = new Date(entry.updated).toISOString()
  var id = date + '-' + provider + '-' + entry.id

  return {
    _id: id,
    provider: provider,
    data: entry
  }
}
