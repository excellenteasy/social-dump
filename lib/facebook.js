'use strict'

var FB = require('fb')
var Promise = require('bluebird')
var db = require('./db')

var e = process.env

var fields = [
  'id',
  'picture',
  'link',
  'name',
  'caption',
  'description',
  'created_time',
  'updated_time',
  'type',
  'icon',
  'message',
  'properties'
]

var exports = module.exports = function () {
  return getAccessToken()
  .then(function(token) {
    FB.setAccessToken(token)
  })
  .then(requestPosts)
  .then(function() {
    setTimeout(function() {
      exports()
    }, 10*60*1000)
  })
}

var since

function requestPosts() {
  var options = { fields: fields }
  if (since) {
    options.since = since
  }

  return FB.api(e.FACEBOOK_USER_ID+'/posts', options, handleApiReponse)
}

function handleApiReponse(res) {
  return new Promise(function(resolve, reject) {
    if (!res || res.error) {
      // TODO: handle errors
      console.log('FACEBOOK: API error - ', res)
      return reject(res)
    }
    since = Math.round(Date.now()/1000)

    if (res.data.length === 0) {
      console.log('FACEBOOK: nothing new')
      return resolve(res)
    }
    return db.save(res.data.map(createPayload), function (err, res) {
      console.log('FACEBOOK: ' + (err ? err : 'db updated'))
      resolve(res)
    })
  })
}

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    FB.api('oauth/access_token', {
      client_id: e.FACEBOOK_CLIENT_ID,
      client_secret: e.FACEBOOK_CLIENT_SECRET,
      grant_type: 'client_credentials'
    }, function (res) {
      if(!res || res.error) {
        console.log(!res ? 'error getting acces token' : res.error)
        reject(res)
      }
      resolve(res.access_token)
    })
  })
}

function createPayload (data) {
  var date = new Date(data.created_time).toISOString()
  var id = date + '-facebook-' + data.id

  return {
    _id: id,
    provider: 'facebook',
    data: data
  }
}
