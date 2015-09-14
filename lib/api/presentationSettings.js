'use strict';

var Promise     = require("bluebird");  
var coroutine   = Promise.coroutine;

var _ = require("lodash");

var dbTableMap = {
  'PRESENTATION': 'Slideshow',
  'EXERCISE': 'Exercise',
  'QUESTION': 'Question'
}

var validLevel = function(level) {
  if ( !_.isString(level) ) return false;

  if ( _.indexOf(Object.keys(dbTableMap), level.toUpperCase()) < 0 ) {
    console.log('sss', level.toUpperCase());
    return false
  }
  return true
}



module.exports = {

  /**
   * List settings of a given presentation, exercise or question;
   */
  list: coroutine(function*(option) {
    var level  = option.level;

    var tableName = dbTableMap[level.toUpperCase()];

    if ( !validLevel(level) ) {
      throw 'Unkown level: ' + level 
      return
    }

    if ( !option.hasOwnProperty('_id') ) {
      Promise.reject(new errors.NotFoundError('id not found'));
    }

    var doc = yield db.model(tableName).findById(option._id).exec();
    if ( _.isNull(doc) ) {
      Promise.reject(new errors.NotFoundError('Invalid id: document now found.'));
    }
    return doc.settings
  }),

  read: coroutine(function* readGen(option) {
    var level  = option.level;
    var tableName = dbTableMap[level.toUpperCase()];

    if ( !validLevel(level) ) {
      throw 'Unkown level: ' + level 
      return
    }

    if ( !option.hasOwnProperty('_id') ) {
      Promise.reject(new errors.NotFoundError('id not found'));
    }

    if ( !option.hasOwnProperty('key') ) {
      Promise.reject(new errors.NotFoundError('key not found'));
    }

    var doc = yield db.model(tableName).findById(option._id).exec();
    if ( _.isNull(doc) ) {
      Promise.reject(new errors.NotFoundError('Invalid id: document now found.'));
    }
    return doc.readSetting(option.key);
  }),

  update: coroutine(function* readGen(option) {
    var level  = option.level;
    var tableName = dbTableMap[level.toUpperCase()];

    if ( !validLevel(level) ) {
      throw 'Unkown level: ' + level 
    }

    if ( !option.hasOwnProperty('_id') ) {
      throw 'Missing _id' 
    }


    if ( option.hasOwnProperty('key') && option.hasOwnProperty('value') ) {
      // single

      var doc = yield db.model(tableName).findById(option._id).exec();
      var attrs = ['key', 'value'];
      console.log('xx', _.pick(option, attrs));
      yield doc.updateSetting(_.pick(option, attrs));
      
    } 
    
    else if ( option.hasOwnProperty('settings') ) {
      // batch
      var doc = yield db.model(tableName).findById(option._id).exec();
      yield doc.updateSettings(option.settings);
    }

    else {
      Promise.reject(new errors.NotFoundError('Invalid paramters.'));
    }

  }),
}