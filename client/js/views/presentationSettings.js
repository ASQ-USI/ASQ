'use strict';

var debug = require('bows')('js/views/presentationSettings')
, io      = require('socket.io-client');
// , dust    = require('dustjs-linkedin');


  // "setting:update-presentation-settings",
  // "setting:update-presentation-settings-live",

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
  // var element = document.querySelector('#exercisesettings');
  // var compiled = dust.compile(element.innerHTML, 'exercise.tl');
  // dust.loadSource(compiled);

  // dust.render("exercise.tl", settings, function(err, output) {
  //   if ( err ) {
  //     debug('Error: failed to render settings.');
  //     return
  //   }
  //   console.log('> ', output);
  //   element.innerHTML = output;
  // });

  settings.forEach(function(slide, index){
    var exercises = slide.exercises;
    exercises.forEach(function(exercise, index){
      var settings = exercise.settings;
      settings.forEach(function(setting, index){
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

  socket: null,

  ACK: function(evt) {
    if ( evt.state ) {
      debug('Settings updated. (' + evt.scope + ' scope)');
      if ( evt.scope === 'presentation' ) {
        applySettingsForAllExercises(evt.data);
      }
    } else {
      debug('Error: failed to update settings.(' + evt.scope + ' scope)');
    }
  },

  initSocket: function() {
    if (! this.socket) {
      var $body   = document.querySelector('body')
      , host      = $body.getAttribute('data-asq-host')
      , port      = parseInt($body.getAttribute('data-asq-port'))
      , session   = $body.getAttribute('data-asq-session-id')
      , token     = $body.getAttribute('data-asq-socket-token')
      , namespace = $body.getAttribute('data-asq-socket-namespace');

      //use connection.js
      var socketUrl =  window.location.protocol + '//' + host + ':' + port + namespace;
      this.socket = io.connect(socketUrl, { 
        'query': 'token=' + token+'&asq_sid=' + session 
      });
      debug('Connected to server.');

      this.socket.on('setting:update-presentation-settings-ack', this.ACK.bind(this));
      
    }
  },

  init: function() {

    document.addEventListener('submit', function(){
      if (event.target.tagName.toLowerCase() =='form'){
        event.preventDefault();
      }     
    });

    this.initSocket.bind(this)();


    [].slice.call(document.querySelectorAll('.settingsBtn'))
      .forEach(function(button, index){

      button.addEventListener('click', function() {
        var query = button.dataset.settingQuery;
        var evt = {
          method: 'PUT',
          scope: button.dataset.settingScope,
          presentationId: button.dataset.settingPresentationId,
          exerciseId: button.dataset.settingExerciseId,
          data: getSettings(query)
        }
        this.socket.emit('setting:update-presentation-scope', evt);
      }.bind(this));
    }, this);
  }
}

