/** 
  * @module client/js/views/pluginSettings.js
  * @description front-end logic for pluginSettings.dust
*/
'use strict';

var debug = require('bows')('js/views/pluginSettings');
var request = require('superagent');
var Dialog = require('../../views/dialog/dialog');
var dust = require('dustjs-linkedin');
var templates = require('imports?dust=dustjs-linkedin!../templates');
var menuDOMBinder = require('./menu');
var utils = require('../utils');

var dlg; // a modal dialogue

module.exports = {

  initDialog: function(){
    //init dialog 
    var dialogEl = document.getElementById('main-dialog');
    dlg = new Dialog(dialogEl);
  },

  reRenderPlugin: function (pluginName, data){
    if(! pluginName){
      debug('reRenderPlugin(): No pluginName provided, will exit')
      return;
    }

    dust.render('views/shared/settingsPluginItem', data, function(err, out){
      if(err){
        debug(err);
        debug(err.stack)
        dlg
          .setErrorContent('Unknown error occured while activating plugin ' + pluginName)
          .toggle();

        return;
      }
      var id = 'settings-plugin-item-' + pluginName;
      var currentPlugin = document.getElementById(id);

      //we don't need the whole out just the innerHTML
      //so we create a dummy element and then get the innerHTML
      // of it's first child (which equals to the root of out)
      var div = document.createElement('div');
      div.innerHTML = out;
      var innerElements = div.firstChild.innerHTML;
      currentPlugin.innerHTML =  innerElements;
    });
  },

  installPlugin : function (pluginName) {
    if(! pluginName){
      debug('installPlugin(): No pluginName provided, will exit')
      return;
    }

    var id = 'settings-plugin-item-' + pluginName;
    var currentPlugin = document.getElementById(id);
    currentPlugin.classList.add('installing')
      
    // send delete request to server
    request
      .post('/plugins/' + pluginName + '/install')
      .set('Accept', 'application/json')
      .end(function(err, res){
        currentPlugin.classList.remove('installing')
        if(err || res.statusType!=2){
          dlg
            .setErrorContent('Unknown error occured while installing plugin ' + pluginName)
            .toggle();
        }else if(res.ok){
          this.reRenderPlugin(pluginName, res.body.plugin);
        }else{
          debug(res.text);
          dlg
            .setErrorContent('An error occured while installing plugin ' + pluginName + ':\n' + res.text)
            .toggle();
        }
      }.bind(this));
  },

  activatePlugin : function (pluginName) {
    if(! pluginName){
      debug('activatePlugin(): No pluginName provided, will exit')
      return;
    }

    var id = 'settings-plugin-item-' + pluginName;
    var currentPlugin = document.getElementById(id);
    currentPlugin.classList.add('activating')
      
    // send delete request to server
    request
      .post('/plugins/' + pluginName + '/activate')
      .set('Accept', 'application/json')
      .end(function(err, res){
        currentPlugin.classList.remove('activating')
        if(err || res.statusType!=2){
          dlg
            .setErrorContent('Unknown error occured while activating plugin ' + pluginName)
            .toggle();
        }else if(res.ok){
          this.reRenderPlugin(pluginName, res.body.plugin);
        }else{
          debug(res.text);
          dlg
            .setErrorContent('An error occured while activating plugin ' + pluginName + ':\n' + res.text)
            .toggle();
        }
      }.bind(this));
  },

  deactivatePlugin : function (pluginName) {
    if(! pluginName){
      debug('deactivatePlugin(): No pluginName provided, will exit')
      return;
    }

    var id = 'settings-plugin-item-' + pluginName;
    var currentPlugin = document.getElementById(id);
    currentPlugin.classList.add('deactivating');
      
    // send delete request to server
    request
      .del('/plugins/' + pluginName + '/activate')
      .set('Accept', 'application/json')
      .end(function(err, res){
        currentPlugin.classList.remove('deactivating')
        if(err || res.statusType!=2){
          dlg
            .setErrorContent('Unknown error occured while deactivating plugin ' + pluginName)
            .toggle();
        }else if(res.ok){
          this.reRenderPlugin(pluginName, res.body.plugin);
        }else{
          debug(res.text);
          dlg
            .setErrorContent('An error occured while deactivating plugin ' + pluginName + ':\n' + res.text)
            .toggle();
        }
      }.bind(this));
  },

  stopLivePresentation : function (btn){
    var username = btn.dataset.username;
    var presentationId = btn.dataset.id;
    var authLevel = btn.dataset.authlevel;
    var url = ['/', username, '/presentations/', presentationId, '/live'].join('');
    debug('DELETE ' + url);

    request
      .del(url)
      .set('Accept', 'application/json')
      .end(function(err, res){
        if(err){
          debug(err);
          dlg
            .setErrorContent('Uknown error occured while stoping the presentation')
            .toggle();
        }
        if(res.ok){
          //re-render thumb
          this.reRenderThumb(presentationId, username);
          // show alert
          dust.render('views/shared/alert', {
            alerts: [
              {dismissible: true,
              type: 'success',
              message: 'Session stopped successfully'}
            ]
          }, function(err, out){
              if(err){
                debug(err);
              }else{
                utils.prependHtml(out, document.getElementById('main-container'));
              }
          });   
        }else{
          debug(res.text);
          dlg
            .setErrorContent('An error occured while stopping the presentation:\n' + res.text)
            .toggle();
        }
      }.bind(this));
  },

  showUploadCommand : function (btn){
    var data = {
        cookie: btn.dataset.cookie,
        title: btn.dataset.title,
        rootUrl: document.location.origin,
        username: btn.dataset.username,
        presentationId : btn.dataset.presentationId
    }
    dust.render('views/shared/presentationUploadCommand', data, function(err, out){
      if(err) throw err;
      dlg.setContent(out);
      utils.selectText(dlg.el.querySelector('.upload-code-snippet-modal'));
      dlg.toggle();
    }); 
  },

  setupEventListeners: function(){
    
    //one click handler for memory performance
    $(document).on('click', '.js-settings-plugin-item__btn', function(evt){ 
      var btn = evt.target;
      var pluginName = btn.dataset.pluginName;

      if(evt.target.classList.contains('js-settings-plugin-item__btn-install')){
        this.installPlugin(pluginName);
      }else if(evt.target.classList.contains('js-settings-plugin-item__btn-activate')){
        this.activatePlugin(pluginName);
      }
      else if(evt.target.classList.contains('js-settings-plugin-item__btn-deactivate')){
        this.deactivatePlugin(pluginName);
      }
    }.bind(this));
  },

  init : function (){
    //disable whitespace supression
    dust.config.whitespace = true;

    //init main menu
    menuDOMBinder();

    //disable no-touch classes
    if ('ontouchstart' in document) {
      $('body').removeClass('no-touch');
    }

    this.initDialog();
    
    //iphone/ipad install as web-app pop up
    $(function(){

      utils.showIOSInstallAsApp();
      this.setupEventListeners();

    }.bind(this))
  }
}
