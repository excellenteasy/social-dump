'use strict'

var cradle = require('cradle')

var e = process.env

var connection = new(cradle.Connection)(e.COUCH_URL, 443, {
  cache: true,
  raw: false,
  forceSave: true,
  secure: true,
  auth: {
    username: e.COUCH_USER,
    password: e.COUCH_PASS
  }
})

module.exports = connection.database('optinmobile-data-' + e.APP_ID.replace('.', '-'))
