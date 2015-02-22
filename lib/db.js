'use strict'

var Bluebird = require('bluebird')

module.exports = function (PouchDB, options) {
  var localDb = new PouchDB('data')

  var remoteURL = 'https://' + options.COUCH_USER + ':' + options.COUCH_PASS + '@' + options.COUCH_URL + '/' + 'optinmobile-data-' + options.APP_ID.replace(/\./g, '-').toLowerCase()
  var remoteDb = new PouchDB(remoteURL)

  return new Bluebird(function(resolve, reject) {
    localDb.replicate.from(remoteDb)

    .on('complete', resolve)

    .on('error', reject)
  })

  .then(function () {
    localDb.sync(remoteDb, {
      live: true
    })

    return localDb
  })
}
