'use strict'

var ig = require('instagram-node').instagram()
ig.use({
  access_token: process.env.INSTAGRAM_ACCESS_TOKEN
})

var db = require('./db')
var firstRunDone = false
var firstRunLastSet = false
var last

var exports = module.exports = function() {
  ig.user_self_media_recent(exports.handleMedia)

  // LOLOL replace w/real-time asap
  setInterval(function() {
    if (!last) return

    ig.user_self_media_recent({
      min_id: last
    }, exports.handleMedia)
  }, 6e4)
}


exports.handleMedia = function handleMedia (err, data, pagination, remaining, limit) {
  if (!firstRunDone && !firstRunLastSet) {
    last = (data[0] || {}).id
    firstRunLastSet = true
  }

  if (firstRunDone) data = data.filter(exports.excludeLast)

  if (!data.length) return

  if (firstRunDone) last = (data[0] || {}).id


  db.save(data.map(exports.createPayload), function (err, res) {
    console.log(arguments)
  })

  if (pagination.next) pagination.next(handleMedia)
  else firstRunDone = true
}

exports.createPayload = function (data) {
  var date = new Date((data.created_time - 0) * 1e3).toISOString()
  var id = date + '-instagram-' + data.id

  return {
    _id: id,
    provider: 'instagram',
    data: data
  }
}

exports.excludeLast = function (data) {
  return data.id !== last
}
