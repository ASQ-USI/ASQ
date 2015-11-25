'use strict';

var debug = require('bows')('js/views/presentationSettings');
var connection = require('../connection.js');
var EventEmitter2 = require('eventemitter2');
var eventBus = new EventEmitter2({delimiter: ':', maxListeners: 100});
var _ = require('lodash');
var assert = require('assert');

function showAlert(flag) {
  var type = flag ? 'alert-success' : 'alert-danger';
  var message = flag ? 'Updated!' : 'Failed to update!';

  var content = document.querySelector('#status-template').content;
  var div = content.querySelector('div');
  div.classList.add(type);

  var text = content.querySelector('strong');
  text.textContent = message;

  document.querySelector('#p-alert-list').appendChild(document.importNode(content, true));
}

var getSettings = function(selector) {
  var settings = {};
  [].slice.call(document.querySelectorAll(selector))
    .forEach(function(setting, index){

    if ( setting.type === 'checkbox' ) {
      settings[setting.name] = setting.checked;
    } else {
      var value = setting.value;
      switch(setting.type){
         case 'number':
         case 'range':
           value = Number(value);
           break;
          case 'date':
            value = Date.parse(value);
            break;
         default:
           break;
      }
      settings[setting.name] = value;
    } 
    
  });
  return settings;
}

// TODO: use dust to render ? YES
var applySettingsForAllExercises = function(settings) {
  settings.forEach(function(slide, index){
    slide.exercises.forEach(function(exercise, index){
      exercise.settings.forEach(function(setting, index){
        var x = document.querySelector('#id' + setting._id);
        if (x.type === 'checkbox') {
          x.checked = setting.value;
        } else {
          x.value = setting.value;
        }
      });
    });
  });

}


module.exports = {

  readSessionInfo: function(){
    var body = document.body;
    var si = {};
    si.protocol    = this.protocol  = window.location.protocol;
    si.body        = this.body       = document.querySelector('body');
    si.host        = this.host       = body.dataset.asqHost;
    si.port        = this.port       = parseInt(body.dataset.asqPort);
    si.sessionId   = this.sessionId  = body.dataset.asqSessionId;
    si.token       = this.token      = body.dataset.asqSocketToken;
    si.namespace   = this.namespace  = body.dataset.asqSocketNamespace == '/' ? '' : body.dataset.asqSocketNamespace;

    assert(true, (_.isString(si.protocol) && !!si.protocol)
      , 'protocol is required');
    assert(true, (_.isString(si.host) && !!si.host)
      , 'host is required');
    assert(true, (si.port > 0)
      , 'port is required');
    assert(true, (_.isString(si.sessionId) && !!si.sessionId)
      , 'sessionId is required');
    assert(true, (_.isString(si.namespace))
      , 'namespace is required');
    assert(true, (_.isString(si.token) && !!si.token)
      , 'token is required');

    return si;
  },


  onResponse: function(evt) {
    var success = evt.status === 'success';
    if ( success ) {
      debug('Settings updated. (' + evt.scope + ' scope)');
      if ( evt.scope === 'presentation' ) {
        applySettingsForAllExercises(evt.settings);
      }
    } else {
      debug('Error: failed to update settings.(' + evt.scope + ' scope)');
    }
    showAlert(success);
  },



  connect: function() {
    var events2Forward = [
      'asq:update_presentation_settings_res',
    ];

    connection.addEvents2Forward(events2Forward);
    connection.connect(this.protocol, this.host, this.port, this.sessionId, this.namespace, this.token, eventBus);
  },

  subscribeToEvents: function() {
    eventBus
      .on('asq:update_presentation_settings_res', this.onResponse)
      .on('socket:connect', function(evt){
        debug.log('connected to ASQ server')
      })
      .on('socket:connect_error', function(evt){
        console.log('error connecting to server');
        debug.log(evt)
      })
      .on('socket:error', function(evt){
        console.log('socket error');
        debug.log(evt)
      });
  },

  init: function() {

    this.subscribeToEvents = this.subscribeToEvents.bind(this);
    this.readSessionInfo = this.readSessionInfo.bind(this);
    this.onResponse = this.onResponse.bind(this);
    this.connect = this.connect;
    

    this.readSessionInfo();
    this.connect();
    this.subscribeToEvents();

    document.addEventListener('submit', function(){
      if (event.target.tagName.toLowerCase() =='form'){
        event.preventDefault();
      }     
    });


    [].slice.call(document.querySelectorAll('.settingsBtn'))
      .forEach(function(button, index){

      button.addEventListener('click', function() {
        var selector = button.dataset.settingQuery;
        var evt = {
          method: 'UPDATE',
          scope: button.dataset.settingScope,
          presentationId: button.dataset.settingPresentationId,
          exerciseId: button.dataset.settingExerciseId,
          settings: getSettings(selector)
        }
        connection.emit('asq:update_presentation_settings', evt);
      }.bind(this));
    }, this);
  }
}


/******************************/
/*            UI              */
/******************************/

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});




