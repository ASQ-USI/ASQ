/** @module lib/ldap
    @description Ldap functionality
*/

var LdapAuth = require('ldapauth-fork')
  , config = require('../config')
  , _ = require('lodash')
  , ldapAuthErrors = [
    'OperationsError',
    'InvalidCredentialsError',
    'NoSuchObjectError']
  , opts;

if(config.enableLdap == true && "undefined" == config.ldapOptions){  
  throw (new Error("No LDAP options set"))
}

opts = config.ldapOptions

/**
* Checks username and password against configured LDAP server
* @param {string} username - The LDAP username of the user.
* @param {string} password - The LDAP password of the user.
* @param {string} done - Passport done callback.
*/
function passportAuthenticateLDAP(username,password, done){
  ldapAuth = new LdapAuth({
    url: opts.url,
    adminDn: 'campus\\'+username,
    adminPassword: password,
    searchScope: opts.searchScope,
    searchBase: opts.searchBase,
    searchFilter:  opts.searchFilter
  });

  ldapAuth.authenticate(username, password, function (err, user) {
    //close connection. the function will call done before the
    // connection is closed but it doesn't matter.
    ldapAuth.close(function(err){
      if (err) {console.log(err);}
    });

    if(err){
      console.log('err', err.toString())
      if((err.name && _.contains(ldapAuthErrors, err.name))
        || (typeof err === 'string' && err.match(/no such user/i))){
        return done(null, false, 'Invalid username/password');
      }else{
        return done(err, null)
      }
    }
    if(user) { 
      var User = db.model('User', schemas.registeredUserSchema);
      User.createOrAuthenticateLdapUser(user, done)
    }
  });
}

exports.passportAuthenticateLDAP = passportAuthenticateLDAP;
