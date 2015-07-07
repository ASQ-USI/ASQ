'use strict';

var debug = require('bows')('presentationSettings')
, io      = require('socket.io-client');
// , dust    = require('dustjs-linkedin');



var getSettings = function(query) {
  var settings = {};
  [].slice.call(document.querySelectorAll(query))
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

// TODO: use dust to render
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

      var socketUrl =  window.location.protocol + '//' + host + ':' + port + namespace;
      this.socket = io.connect(socketUrl, { 
        'query': 'token=' + token+'&asq_sid=' + session 
      });
      debug('Connected to server.');

      this.socket.on('setting:update-presentation-settings-ack', this.ACK.bind(this));
      
    }
  },

  init: function() {

    [].slice.call(document.querySelectorAll('form'))
      .forEach(function(form, index){
      form.addEventListener('submit', function(event) {
        event.preventDefault();
      })  
    });


    this.initSocket.bind(this)();


    [].slice.call(document.querySelectorAll('.settingsBtn'))
      .forEach(function(button, index){

      button.addEventListener('click', function() {
        var query = button.getAttribute('setting-query');
        var evt = {
          method: 'PUT',
          scope: button.getAttribute('setting-scope'),
          presentationId: button.getAttribute('setting-presentation-id'),
          exerciseId: button.getAttribute('setting-exercise-id'),
          data: getSettings(query)
        }
        this.socket.emit('setting:update-presentation-scope', evt);
      }.bind(this));
    }, this);
  }
}

