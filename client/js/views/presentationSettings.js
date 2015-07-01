'use strict';

var $ = require('jquery')
  , request = require('superagent')


var getSlideshowSettings = function() {

  var settings = {};
  [].slice.call(document.querySelectorAll('.slideshow-setting'))
    .forEach(function(setting, index){

    if ( setting.type === 'checkbox' ) {
      settings[setting.name] = setting.checked;
    } else {
      settings[setting.name] = setting.value;
    } 
    
  });
  return settings;
}

module.exports = {


  init: function(){

    // Prevent all forms from submission.
    [].slice.call(document.querySelectorAll('form'))
      .forEach(function(form, index){
      form.addEventListener('submit', function(event) {
        event.preventDefault();
      })  
    });

    document.querySelector('#slideshowSettingsSave')
      .addEventListener('click', function() {

      request
        .put('settings')
        .send(getSlideshowSettings())
        .set('Accept', 'application/json')
        .end(function(err, res){
          // handle error
          if(err || res.statusType!=2){
            alert('Something went wrong with removing your presentation: ' + 
              (err!=null ? err.message : JSON.stringify(res.body)));
            return;
          }
          console.log(res);
        });
    });
  }
}