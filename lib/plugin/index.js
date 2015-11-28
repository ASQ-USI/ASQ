/** 
  * @module lib/plugins/index
  * @description plugins logic entry point
*/
//most of the code here is adapted from Ghost https://github.com/TryGhost/Ghost/

'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var _ = require('lodash');
var settings = require('../settings');
var loader = require('./loader');
var logger = require('logger-asq');
var Plugin = db.model('Plugin');
var registry = require('./registry')

var getInstalledPluginsByName = coroutine( function *getInstalledPluginsByNameGen( ){
  var plugins = yield Plugin.find({isInstalled: true}, {_id: 0, name: 1}).lean().exec();

  return plugins.map(function installedPluginMap (plugin){
    return plugin.name;
  });
});

var getActivePluginsByName = coroutine( function *getActivePluginsByNameGen (){
  var plugins = yield Plugin.find({isActive: true}, {_id: 0, name: 1}).lean().exec();

  return plugins.map(function activePluginMap (plugin){
    return plugin.name;
  });
});

var getPluginsByName = coroutine( function *getPluginsByNameGen (){
  var plugins = yield Plugin.find({}, {_id: 0, name: 1}).lean().exec();

  return plugins.map( function pluginMap ( plugin){
    return plugin.name;
  });
});


var saveAvailablePlugins = coroutine( function *saveAvailablePluginsGen (availablePlugins) {
  var currentPluginNames = yield getPluginsByName();

  var availablePluginNames = _.map(availablePlugins, function availablePluginMap(pluginInfo){
    return pluginInfo.name;
  });

  //only list plugins that we scanned in the filesystem. Remove the rest
  var pluginNamesToCreate = _.difference(availablePluginNames, currentPluginNames);
  var pluginNamesToRemove = _.difference(currentPluginNames, availablePluginNames);

  var createPromise =  Promise.map(availablePlugins, function createAvailablePluginMap(pluginInfo){
    if(_.contains(pluginNamesToCreate, pluginInfo.name)){
      var plugin = new Plugin(pluginInfo);
      return plugin.save();
    }
  });

  var removePromise = Plugin.remove({name : {$in: pluginNamesToRemove}}).exec();

  yield Promise.all([createPromise, removePromise ])
});

function saveInstalledPlugins (installedPlugins){
  
  return  Plugin.update(
    {name : {$in: installedPlugins}},
    {$set : { isInstalled: true   }},
    { multi: true }).exec();
};

module.exports = { 
  init : coroutine(function *initGen(){
    loader.checkPluginDir();

    var available = yield loader.getAvailablePlugins();
    yield saveAvailablePlugins(available);

    var active = yield getActivePluginsByName();
    var installed = yield getInstalledPluginsByName();

    var newlyInstalled = [];

    // notice that we not using the installPlugin and activatePlugin methods
    // of this object because we want to batch-update the database with the 
    // names of all the newly install plugins and avoiding querying for active
    // plugins (since we're going to activate them now)
    yield Promise.map(active, coroutine( function *activatePluginsGen (pluginName){
      if(! _.contains(installed, pluginName)){
         yield loader.installPlugin(pluginName);
      }
      newlyInstalled.push(pluginName);

      var loadedPlugin = loader.activatePlugin(pluginName);
      logger.info('Activated plugin ' + pluginName);
    }));

    yield saveInstalledPlugins(newlyInstalled);
    logger.info('Active plugins loaded');
  }),

  installPlugin : coroutine( function *installPluginGen (pluginName){
    var plugin = yield Plugin.findOne({name: pluginName}).exec();

    if(!plugin){
      throw new Error('installPlugin(): plugin ' + pluginName + ' does not exist')
    }

    if( plugin.isInstalled){
      logger.warn('installPlugin(): plugin ' + pluginName + ' is already installed');
      return;
    }

    yield loader.installPlugin(pluginName);
    plugin.isInstalled = true;

    //persist to db
    yield plugin.save();
    return plugin.toObject();
  }),

  activatePlugin : coroutine( function *activatePluginGen (pluginName){
    var plugin = yield Plugin.findOne({name: pluginName}).exec();

    if(!plugin){
      throw new Error('activatePlugin(): plugin ' + pluginName + ' does not exist')
    }

    //make sure it's installed first
    if( ! plugin.isInstalled){
      yield loader.installPlugin(pluginName);
      plugin.isInstalled = true;
    }

    if( plugin.isActive){
      logger.warn('activatePlugin(): plugin ' + pluginName + ' is already activated');
      return;
    }

    var loadedPlugin = loader.activatePlugin(pluginName);
    plugin.isActive = true;

    logger.info('Activated plugin ' + pluginName);

    //persist to db
    yield plugin.save();
    return plugin.toObject();
  }),

  deactivatePlugin : coroutine( function *activatePluginGen (pluginName){
    var plugin = yield Plugin.findOne({name: pluginName}).exec();

    if(!plugin){
      throw new Error('activatePlugin(): plugin ' + pluginName + ' does not exist')
    }

    if( ! plugin.isActive){
      logger.warn('deactivatePlugin(): plugin ' + pluginName + ' is already deactivated');
      return;
    }

    registry.deregisterPlugin(pluginName)
    plugin.isActive = false;

    logger.info('Deactivated plugin ' + pluginName);

    //persist to db
    yield plugin.save();
    return plugin.toObject();
  }),

  getPluginNamesByType : coroutine(function *getActivePluginNames(){
    var elementPromise = Plugin.find(
      {type : {$in: ['exercise','element']}, isActive: true},
      {_id:0, name: 1} ).lean().exec();

    var questionPromise = Plugin.find(
      {type : 'question', isActive: true},
      {_id:0, name: 1} ).lean().exec();

    var results = yield Promise.all([elementPromise , questionPromise])

    var elementNames = results[0].map(function (el){ return el.name; });
    var questionNames = results[1].map(function (el){ return el.name; });

    // question types are also elements
    elementNames = _.uniq(elementNames.concat(questionNames));

    return {
      element : elementNames,
      question: questionNames
    }
  })
}