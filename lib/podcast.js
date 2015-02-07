'use strict'

var request = require('request')
var pickup = require('pickup')

var db = require('./db')

var exports = module.exports = function crawl () {

  // TODO: bulk insertion
  request(process.env.PODCAST_URL).pipe(pickup({eventMode: true}))

  .on('entry', function (entry) {
    var date = new Date(entry.updated).toISOString()
    var id = date + '-podcast-' + entry.id

    db.save({
      _id: id,
      provider: 'podcast',
      data: entry
    }, function() {
      console.log(arguments)
    })
  })

  setTimeout(crawl, 60 * 60 * 1e3)
}
