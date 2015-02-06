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
}

function requestPosts() {
  return FB.api(e.FACEBOOK_USER_ID+'/posts', { fields: fields }, function(res) {
    if (!res || res.error) {
      // TODO: handle errors
      console.log(res)
      return;
    }
    db.save(res.data.map(createPayload), function (err, res) {
      console.log(arguments)
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
        console.log(!res ? 'error occurred' : res.error)
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
