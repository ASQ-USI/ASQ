/**
 * @module config/helpers
 * @description helpers for configuration
 **/
'use strict';

const _ = require('lodash');

module.exports = {

  booleanOrDefault: function (val, dflt){
    if(val ==="true") val = true;
    if(val ==="false") val = false;
    
    return _.isBoolean(val) ? val : dflt;
  },

  createMongoUri: function(mongoConf){
    if(!_.isObject(mongoConf)){
      let msg = 'No mongo configuration object.';
      msg += ' Make sure you provide a `mongo` object with valid configuration';
      throw new Error(msg);
    }

    if(_.isNull(mongoConf.host) || _.isUndefined(mongoConf.host)){
      let msg = 'No mongo.host specified.';
      msg += ' Please specify a valid mongo host';
      throw new Error(msg);
    }

    if(_.isNull(mongoConf.port) || _.isUndefined(mongoConf.port)){
      let msg = 'No mongo.port specified.';
      msg += ' Please specify a valid mongo port';
      throw new Error(msg);
    }

    let mUserPass = '';
    let m = mongoConf;
    if(mongoConf.username){
      if(! mongoConf.hasOwnProperty('password')){
        throw new Error('No mongo.password in config. If you specify a username you need to also specify a password.')
      }
      mUserPass = mongoConf.username + ':' + mongoConf.password + '@';
    }
    let mongoUri = ['mongodb://', mUserPass, m.host, ':', m.port, '/', m.dbName].join('');

    return mongoUri;
  }

}