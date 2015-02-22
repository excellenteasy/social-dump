'use strict'

var PouchDB = require('pouchdb')
var Bluebird = require('bluebird')
var replicationStream = require('pouchdb-replication-stream')

PouchDB.plugin(replicationStream.plugin)
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream)

module.exports = function (options) {
  var localDb = new PouchDB('local', {
    db: require('memdown')
  })

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
