'use strict';

var bluebird = require ('bluebird');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var Promise = require('bluebird');
var config = require('../../config');
var logger = require('logger-asq');
var Proxy = require('./proxy');
var PluginDependencies = require('./PluginDependencies');
var config = require('../../config');

Promise.promisifyAll(fs);
var coroutine = Promise.coroutine;


function getAbsolutePluginPath(pluginName){
  return path.join(config.pluginDir, pluginName)
}

module.exports = {
  checkPluginDir: function(){
    var pluginDir = config.pluginDir

    // make sure plugin directory exists
    if(!pluginDir){
      throw new Error('config.pluginDir is null or undefined. You need to set this!')
    }

    if( ! fs.existsSync(pluginDir)){
      logger.log({
        pluginDir:pluginDir
      },'Creating pluginDir at ' + pluginDir)
      // TODO if mkdirp fails is a fatal mistake for now (we don't catch it anywhere)
      // should this change?.
      mkdirp.sync(pluginDir);
    }
  },

  getPluginInfo: function(pluginDirName){
    var info = {};
    
    try{
      var pJSONPath = path.join(getAbsolutePluginPath(pluginDirName), 'package.json')
      var pack = require(pJSONPath);
      info.name = pack.name || pluginsDirName;
      info.description = pack.description || '';
      info.version = pack.version || '';
      info.type = pack.asq.type || 'generic';
    }catch(err){

      if(err.name ==='SyntaxError'){
        
        logger.error({
          err: err,
          stack: err.stack
        }, 'Plugin ' + pluginDirName + ' has an invalid package.json file.\nIt will not be loaded.')
        
        // return undefined info to get the plugin removed
        // from the list of available plugins
        return undefined;
      }else if(err.code ==='MODULE_NOT_FOUND'){
        
        //we will use the folder name
        info.name = pluginDirName;
        info.description =  '';
      }
    }finally{
      return info;
    }
  },

  getAvailablePlugins: coroutine(function *getAvailablePluginsGen(){
    try{
      var pluginsDir = config.pluginDir;

      // dirContents is an Array of promises
      var pluginDirs = yield fs.readdirAsync(pluginsDir).map(function(name){
        var fullPath = getAbsolutePluginPath(name)
        return fs.lstatAsync(fullPath).then(function(stats){
          // we accept only directories for now
          if(stats.isDirectory()){
            return name;
          }
          logger.warn('Expected ' + fullPath + 'to be a directory.\nIt will not be loaded.')
          return undefined;
        })

      });

      // clean up file entries
      pluginDirs = _.pull(pluginDirs, undefined);

      // get package name and description
      var availablePluginsInfo = yield Promise.map(pluginDirs, this.getPluginInfo);

      // clean up undefined info entries
      availablePluginsInfo = _.pull(availablePluginsInfo, undefined);

      return availablePluginsInfo;
    }catch(err){
      logger.error({err: err}, 'Error loading plugins');
    }
  }),

  installPlugin : coroutine(function *installPluginGen(pluginName){
    try{
      logger.debug('Installing plugin ' + pluginName);
      var pluginPath = getAbsolutePluginPath(pluginName);
      var deps = new PluginDependencies(pluginPath);

      yield deps.install();
   }catch(err){
      var message = 'Error installing plugin ' + pluginName;
      logger.error({err: err}, 'Error installing plugin ' + pluginName);
      throw new InternalServerError(message);  
    }
  }),

  activatePlugin : function (pluginName){
    logger.debug('Activating plugin ' + pluginName);
    var pluginPath = getAbsolutePluginPath(pluginName);
    var plugin;

    try{
      var Plugin = require(pluginPath);

      if(_.isFunction(Plugin)){
        plugin = new Plugin(new Proxy(pluginName));
      }

      return plugin;
   }catch(err){
      var message = 'Error loading plugin ' + pluginName;
      logger.error({err: err}, 'Error loading plugin ' + pluginName);
      throw new InternalServerError(message);  
    }
  }
}
