'use strict'

var PouchDB = require('pouchdb')

module.exports = function (options) {
  var localDb = new PouchDB('local', {
    db: require('memdown')
  })

  var remoteURL = 'https://' + options.COUCH_USER + ':' + options.COUCH_PASS + '@' + options.COUCH_URL + '/' + 'optinmobile-data-' + options.APP_ID.replace(/\./g, '-').toLowerCase()
  var remoteDb = new PouchDB(remoteURL)

  return remoteDb.allDocs({
    include_docs: true
  })

  .then(function (res) {
    var docs = res.rows.map(function (row) {
      return row.doc
    })

    return localDb.bulkDocs(docs)
  })

  .then(function () {
    localDb.sync(remoteDb, {
      live: true
    })

    return localDb
  })
}
