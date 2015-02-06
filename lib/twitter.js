'use strict'

var Twit = require('twit')

var db = require('./db')

var e = process.env

var t = new Twit({
  consumer_key: e.TWITTER_CONSUMER_KEY,
  consumer_secret: e.TWITTER_CONSUMER_SECRET,
  access_token: e.TWITTER_ACCESS_TOKEN,
  access_token_secret: e.TWITTER_ACCESS_TOKEN_SECRET
})

var stream = t.stream('user', {
  with: 'user'
})

var exports = module.exports = function () {
  stream.on('tweet', function (data) {
    db.save(createPayload(data), function (err, res) {
      console.log(arguments)
    })
  })

  t.get('statuses/user_timeline', {
    count: '200',
    exclude_replies: true,
    contributor_details: true,
    include_rts: true
  }, function(err, data, res) {
    db.save(data.map(createPayload), function (err, res) {
      console.log(arguments)
    })
  })

  return stream
}

function createPayload (data) {
  var date = new Date(data.created_at).toISOString()
  var id = date + '-twitter-' + data.id_str

  return {
    _id: id,
    provider: 'twitter',
    data: data
  }
}
