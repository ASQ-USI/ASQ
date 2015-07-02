'use strict';

var $ = require('jquery')
  , request = require('superagent')


var getSettings = function(query) {
  console.log('getSettings', query);
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

      var query = '.slideshow-setting';
      request
        .put('settings')
        .send({
          scope: 'slideshow',
          data: getSettings(query)
        })
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


    [].slice.call(document.querySelectorAll('.exerciseSettingsBtn'))
      .forEach(function(button, index){

      button.addEventListener('click', function(event) {

        console.log('.exerciseSettingsBtn', event.target.id);

        var query = '.exercise-setting-' + event.target.id;
        request
          .put('settings')
          .send({
            scope: 'exercise',
            exerciseId: event.target.id,
            data: getSettings(query)
          })
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
    });
  }
}