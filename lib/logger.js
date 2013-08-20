/**
  @fileoverview seteup loggers
**/

'use strict';

var winston   = require('winston')
, sugar       = require('sugar')
, logConfig   = require('../config').log
, appConfig   = logConfig.application
, dbConfig    = logConfig.db
, socConfig   = logConfig.sockets
, fs          = require('fs')
, path        = require('path')
, getDirname  = path.dirname
, mkdirp      = require('mkdirp')

//TODO: Have default options for logger

// the reason we have createFileIfNotExistsSync here
// instead of having it inside fs-util is because
// we need the logger to be independent in order for
// other app files to be able to use it
function createFileIfNotExistsSync(path){
  if(fs.existsSync(path)){
    return true;
  }else{
    mkdirp.sync(getDirname(path));
    //write and close immediately
    fs.closeSync(fs.openSync(path, 'w'));
    return true;
  }
}


//create log files if they don't exist
if(appConfig.file && appConfig.file.trim()!=""){
  createFileIfNotExistsSync(appConfig.file)
}

if(dbConfig.file && dbConfig.file.trim()!=""){
  createFileIfNotExistsSync(dbConfig.file)
}

if(socConfig.file && socConfig.file.trim()!=""){
  createFileIfNotExistsSync(socConfig.file)
}

//
// Configure the logger for application related messages
//
winston.loggers.add('application', {
  console: {
    level: appConfig.level,
    colorize: 'true',
    label: 'APP'
  },
  transports: [
    new winston.transports.File({
      level: appConfig.level,
      filename: appConfig.file,
      json: appConfig.json 
    })
  ]
});

//
// Configure the logger for database errors
//
winston.loggers.add('db', {
  console: {
    level: dbConfig.level,
    colorize: 'true',
    label: 'DB'
  },
  transports: [
    new winston.transports.File({
      level: dbConfig.level,
      filename: dbConfig.file,
      json: dbConfig.json 
    })
  ]
});

//
// Configure the logger for application related messages
//
winston.loggers.add('sockets', {
  console: {
    level: socConfig.level,
    colorize: 'true',
    label: 'SOC'
  },
  transports: [
    new winston.transports.File({
      level: "debug", // Must provide all the methods.
                      // Setting the level is done in the socket directly.
      filename: socConfig.file,
      json: socConfig.json 
    })
  ]
});

module.exports = {
  appLogger : winston.loggers.get('application'),
  dbLogger  : winston.loggers.get('db'),
  socLogger : winston.loggers.get('sockets')
}
