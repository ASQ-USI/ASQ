'use strict';

var bluebird = require ('bluebird')
var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp');
var _ = require("lodash");
var Promise = require('bluebird');
var config = require('../../config');
var logger = require('../logger').appLogger
var Proxy = require('./proxy')

Promise.promisifyAll(fs);
var coroutine = Promise.coroutine;

module.exports = {
  checkPluginDir: function(){

    //make sure plugin directory exists
    if(!config.pluginDir){
      throw new Error("config.pluginDir is null or undefined. You need to set this!")
    }

    var pluginDir =  path.resolve(app.get('rootDir'), config.pluginDir);
    if( ! fs.existsSync(pluginDir)){
      logger.log({
        pluginDir:pluginDir
      },"Creating pluginDir at " + pluginDir)
      // TODO if mkdirp fails is a fatal mistake for now (we don't catch it anywhere)
      // should this change?.
      mkdirp.sync(pluginDir);
    }
    app.set('pluginDir', pluginDir);
  },

  loadPlugins: coroutine(function *loadPluginsGen(){
    try{
      var pluginDir = app.get('pluginDir');

      //dirContents is an Array of promises
      var dirContents = fs.readdirAsync(pluginDir).map(function(name){

        logger.debug('loading plugin `%s`', name )
        return path.resolve(pluginDir + '/' + name);
      });
      yield Promise.map(dirContents, this.loadPlugin);

      return;
    }catch(err){
      console.log(err.stack)
      logger.error({err: err}, "Error loading plugins");
    }
  }),

  loadPlugin : coroutine(function *loadPluginGen(pluginPath){
    var stats = yield fs.lstatAsync(pluginPath);
    if(! stats.isDirectory()) return;

   try{
    var Plugin = require(pluginPath);

    if(_.isFunction(Plugin)){
      var plugin = new Plugin(new Proxy());
    }
   }catch(err){
     console.log(err.stack)
    logger.error({err: err}, "Error loading plugin at " + pluginPath);  
   }
   

  }),

  init : function(){
    this.checkPluginDir();
    this.loadPlugins();
  }
}
