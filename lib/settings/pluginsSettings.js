/** @module lib/settings/pluginsSettings
    @description settings logic for plugins
*/
'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var _ = require('lodash');
var Plugin = db.model('Plugin');
var plugins = require('../plugin')

module.exports = {
  getPluginsSettings : coroutine(function *getUserSettingsGen (){

    var plugins = yield Plugin.find({}).exec();

    return {
      activeMenu: 'plugins',
      plugins: plugins
    }
  }),
}