'use strict'

var Twit = require('twit')

var exports = module.exports = function (options, db) {
  var t = new Twit({
    consumer_key: options.TWITTER_CONSUMER_KEY,
    consumer_secret: options.TWITTER_CONSUMER_SECRET,
    access_token: options.TWITTER_ACCESS_TOKEN,
    access_token_secret: options.TWITTER_ACCESS_TOKEN_SECRET
  })

  var stream = t.stream('user', {
    with: 'user'
  })

  stream.on('tweet', function (data) {
    db.save(createPayload(data), function (err, res) {
      console.log(arguments)
    })
  })

  t.get('statuses/user_timeline', {
    user_id: options.TWITTER_USER_ID || null,
    count: '200',
    exclude_replies: true,
    contributor_details: true,
    include_rts: true
  }, function(err, data, res) {
    db.save(data.map(exports.createPayload), function (err, res) {
      console.log(arguments)
    })
  })

  return stream
}

exports.createPayload = function (data) {
  var date = new Date(data.created_at).toISOString()
  var id = date + '-twitter-' + data.id_str

  return {
    _id: id,
    provider: 'twitter',
    data: data
  }
}
