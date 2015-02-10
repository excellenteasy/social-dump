'use strict'

var cradle = require('cradle')

module.exports = function (options) {
  var connection = new (cradle.Connection)(options.COUCH_URL, 443, {
    cache: true,
    raw: false,
    forceSave: true,
    secure: true,
    auth: {
      username: options.COUCH_USER,
      password: options.COUCH_PASS
    }
  })

  return connection.database('optinmobile-data-' + options.APP_ID.replace(/\./g, '-'))
}
