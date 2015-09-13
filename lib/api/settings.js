'use strict';

var Promise     = require("bluebird");  
var coroutine   = Promise.coroutine;

var dbTableMap = {
  'PRESENTATION': 'Presentation',
  'EXERICSE': 'Exercise',
  'QUESTION': 'Question'
}

var validLevel: function(level) {
  if ( !_.isString(level) ) return false;

  if ( ! _.includes(Object.keys(dbTableMap), ) ) {
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

    if ( !validLevel(tableName) ) {
      throw 'Unkown level: ' + level 
    }

    if ( !option.hasOwnProperty('_id') ) {
      throw 'Missing _id' 
    }

    var query = _.pick(option, '_id');

    var doc = yield db.model(tableName).find(query).lean().exec();

    return doc.listSettings();
  }),

  read: coroutine(function* readGen(option) {
    var level  = option.level;
    var tableName = dbTableMap[level.toUpperCase()];

    if ( !validLevel(tableName) ) {
      throw 'Unkown level: ' + level 
    }

    if ( !option.hasOwnProperty('_id') ) {
      throw 'Missing _id' 
    }

    if ( !option.hasOwnProperty('key') ) {
      throw 'Missing key' 
    }

    var query = _.pick(option, '_id');

    var doc = yield db.model(tableName).findOne(query).exec();

    return yield doc.readSetting(option.key);
  }),

  update: coroutine(function* readGen(option) {
    var level  = option.level;
    var tableName = dbTableMap[level.toUpperCase()];

    if ( !validLevel(tableName) ) {
      throw 'Unkown level: ' + level 
    }

    if ( !option.hasOwnProperty('_id') ) {
      throw 'Missing _id' 
    }


    if ( option.hasOwnProperty('key') && option.hasOwnProperty('value') ) {
      // single

      var query = {
        _id: option_id
      }

      var doc = yield db.model(tableName).findOne(query).exec();
      var attrs = ['key', 'value']
      yield doc.updateSetting(_.pick(attrs));
      
    } 
    
    else if ( option.hasOwnProperty('settings') ) {
      // batch
      var query = {
        _id: option_id
      }

      var doc = yield db.model(tableName).findOne(query).exec();
      yield doc.updateSettings(option.settings);
    }
  }),
}