/** @module lib/ldap
    @description Ldap authentication for asq
*/

var ldap = require('ldapjs');
var config = require('../config')
var _ = require('lodash')

var client, opts;

if(config.enableLdap === true){
  opts = config.ldapOptions
  var client = ldap.createClient({
    url: opts.url
  });
}

function callCbOnce(isCalled, cb, err, res){
  if (isCalled || ! _.isFunction(cb)) return;

  cb(err, res)
  return true;
}

function isLDAPUsername(username, cb){
  if(config.enableLdap === false){
    var errMsg = 'LDAP is disabled, check your configuration (enableLdap option)';
    if (_.ifFunction(cb)) cb(new Error(errMsg), null);
    return;
  }

  var cbCalled =false
    , base = opts.searchBase;

  var searchOpts = {
    filter: '('+ opts.searchUserField +'=' + username + ')',
    scope : opts.searchScope
  };

  client.search(base, searchOpts, function(err, res) {
    if(err){
      cbCalled = callCbOnce(cbCalled, cb, err, null);
    }
    res.on('searchEntry', function(entry) {
      console.log('entry: ' + JSON.stringify(entry.object));
      cbCalled = callCbOnce(cbCalled, cb, null, true);
    });
    res.on('searchReference', function(referral) {
      console.log('referral: ' + referral.uris.join());
      // this is a search reference to another server but
      // we don't handle this case
      cbCalled = callCbOnce(cbCalled, cb, null, false);
    });
    res.on('error', function(err) {
      console.error('error: ' + err.message);
      cbCalled = callCbOnce(cbCalled, cb, err, null);
    });
    res.on('end', function(result) {
      console.log('status: ' + result.status);
      //if callback isnet called already we found nothing
      cbCalled = callCbOnce(cbCalled, cb, null, false);
    });
  });
}

isLDAPUsername('triglv');

module.exports.isLDAPUsername = isLDAPUsername;