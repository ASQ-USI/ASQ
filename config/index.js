/** @module config/index
    @description Main file for config files.
*/

'use strict';

var _ = require('underscore'),
fs = require('fs'),
defaultConf = require('./config.defaults.js'),
env = process.env.NODE_ENV || 'development',
envConf={},
conf = {}

if (fs.existsSync('./config.'+ env)){
  envConf = require('./config.'+ env);
}else{
  console.log('Info: There is no configuration file for '+env+ " environment");
}

//overwrite default configuration with env configuration
_.extend(conf, defaultConf, envConf);
module.exports = conf;
