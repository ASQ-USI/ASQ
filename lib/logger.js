/**
  @fileoverview seteup loggers
**/

'use strict';

var winston   = require('winston')
, sugar       = require('sugar')
, logSettings = require('../config').log
, appSettings = logSettings.application
, dbSettings  = logSettings.db
, fs          = require('fs')
, path        = require('path')
, getDirname  = path.dirname
, mkdirp      = require('mkdirp')

console.log(appSettings)

// the reason we have createFileIfNotExistsSync here
// instead of having it inside fs-util is because
// we need the logger to be independent in order for
// other app files to be able to use it
function createFileIfNotExistsSync(path){
  if(fs.existsSync(path)){
    console.log(path + " exists")
    return true;
  }else{
    mkdirp.sync(getDirname(path));
    //write and close immediately
    fs.closeSync(fs.openSync(path, 'w'));
    return true;
  }
}


//create log files if they don't exist
if(appSettings.file && appSettings.file.trim()!=""){
  createFileIfNotExistsSync(appSettings.file)
}

if(dbSettings.file && dbSettings.file.trim()!=""){
  createFileIfNotExistsSync(dbSettings.file)
}

//
// Configure the logger for application related messages
//
winston.loggers.add('application', {
  console: {
    level: logSettings.application.level,
    colorize: 'true',
    label: 'app'
  },
  transports: [
    new winston.transports.File({
      level: appSettings.level,
      filename: appSettings.file,
      json: appSettings.json 
    })
  ]
});

//
// Configure the logger for database errors
//
winston.loggers.add('db', {
  console: {
    level: logSettings.db.level,
    colorize: 'true',
    label: 'db-error'
  },
  transports: [
    new winston.transports.File({
      level: logSettings.db.level,
      filename: logSettings.db.file,
      json: logSettings.db.json 
    })
  ]
});

module.exports = {
  appLogger : winston.loggers.get('application'),
  dbLogger  : winston.loggers.get('db')
}
