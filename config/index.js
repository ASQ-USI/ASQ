/** @module config/index
    @description Main file for config files.
*/
'use strict';

//we import winston instead of the dedicated loggers because they are not setup yet

var
winston     = require('winston'),
_           = require('underscore'),
fs          = require('fs'),
defaultConf = require('./config.defaults.js'),
env         = process.env.NODE_ENV || 'development',
envConf     ={},
conf        = {}

if (fs.existsSync(__dirname + '/config.'+ env + '.js')){
  envConf = require('./config.'+ env);
}else{
  winston.info('There is no configuration file for environment: '+env);
}

//overwrite default configuration with env configuration
_.extend(conf, defaultConf, envConf);
module.exports = conf;
