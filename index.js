'use strict'

var express = require('express')
var app = express()

app.get('/', function(req, res) {
  res.sendStatus(200)
})

app.listen(process.env.PORT | 5000)

require('./lib/twitter')()
require('./lib/facebook')()
require('./lib/feed')()
