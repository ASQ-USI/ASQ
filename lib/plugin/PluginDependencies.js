/** 
 * @module lib/plugin/PluginDependencies
 * @description install plugin dependencies
*/
// adapted from Ghost https://github.com/TryGhost/Ghost/
'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var spawn = require('child_process').spawn;
var win32 = process.platform === 'win32';

function PluginDependencies(pluginPath) {
    this.pluginPath = pluginPath;
}

PluginDependencies.prototype.install = function installPluginDependencies() {
  var spawnOpts;
  var self = this;

  return new Promise(function (resolve, reject) {
    fs.stat(path.join(self.pluginPath, 'package.json'), function (err) {
      if (err) {
        // File doesn't exist - nothing to do, resolve right away?
        resolve();
      } else {
        // Run npm install in the plugin directory
        spawnOpts = {
            cwd: self.pluginPath
        };

        self.spawnCommand('npm', ['install', '--production'], spawnOpts)
          .on('error', reject)
          .on('exit', function (err) {
            if (err) {
                reject(err);
            }

            resolve();
          });
      }
    });
  });
};

// Normalize a command across OS and spawn it; taken from yeoman/generator
PluginDependencies.prototype.spawnCommand = function (command, args, opt) {
  var winCommand = win32 
    ? 'cmd' 
    : command;
  var  winArgs = win32 
    ? ['/c'].concat(command, args) 
    : args;

  opt = opt || {};

  return spawn(winCommand, winArgs, _.defaults({stdio: 'inherit'}, opt));
};

module.exports = PluginDependencies;
