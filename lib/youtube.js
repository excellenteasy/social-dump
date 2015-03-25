'use strict'

var Bluebird = require('bluebird')
var yt = require('youtube-api')
var listChannels = Bluebird.promisify(yt.channels.list)
var listSearch = Bluebird.promisify(yt.search.list)

module.exports = function (options, db) {
  yt.authenticate({type: 'key', key: options.YOUTUBE_KEY})
  return getYoutubeChannelIdForUser(options.YOUTUBE_NAME).then(function (id) {
    return listSearch({channelId: id, maxResults: 50, type: 'video', part: 'snippet,id', order: 'date'}).then(function (data) {
      return db.bulkDocs(data[0].items.map(createPayload), function (err, res) {
        console.log(err, res)
      })
    })
  }).catch(function (err) {
    return console.log(err)
  })
}

function getYoutubeChannelIdForUser (name) {
  return listChannels({part: 'id', forUsername: name}).then(function (res) {
    return res[0].items[0].id
  })
}

function createPayload (item) {
  return {
    _id: item.snippet.publishedAt + '-youtube-' + item.snippet.channelId,
    provider: 'youtube',
    data: item.snippet
  }
}
