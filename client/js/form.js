/*
* This works a little bit like this: you can call from an external module
* <pre>forms.setup(viewName)</pre> and the setup function will search for
* a <pre>viewName</pre> property in the binders and, if it's a function, 
* it will call it. This way you can specify form logic per view
*/

'use strict'
var $        = require('jQuery')
, _          = require ('lodash')
, validation = require('../../shared/validation');


var binders = {
  'signup' : signupFormBinder,
}

function setup(viewName){
  if (binders.hasOwnProperty(viewName) && typeof binders[viewName] == 'function'){
    binders[viewName]();
  }else{
  }
}

var form = module.exports = {
    setup : setup
}

//TODO Proper check using promises
//Use same validation as the server
//Check email against the server for uniqueness and set default username as email up to the @
//signin form
function signupFormBinder(){

  $(function(){
    var inputSelectors = 'input[type=text], input[type=email], input[type=password]';

    var validate = {
      'inputFirstname' : function checkFirstname() {
        console.log('Firstname trigger check');
        defaultValidate('inputFirstname', validation.getErrorFirstname);
      },

      'inputLastname' : function checkLastname() {
        console.log('Lastname trigger check');
        defaultValidate('inputLastname', validation.getErrorLastname);
      },

      'inputEmail' : function checkEmail() {
        defaultValidate('inputEmail', validation.getErrorEmail,
          function emailServerCheck(elem) {
            $.ajax('/email_available/?email=' + elem.val().toLowerCase())
            .done(function(reply) {
              if (!!reply.err) {
                elem.siblings('div.sidetip').children('p.' + reply.err).addClass('active');
              } else {
                elem.siblings('div.sidetip').children('p.isaok').addClass('active');
                isValid.email = true;
              }
              // Set username from email
              if (!!reply.username && !$('#inputUsername').val()) {
                var userInput = $('#inputUsername');
                userInput.val(reply.username);
                userInput.siblings('div.sidetip').children().removeClass('active');
                userInput.siblings('div.sidetip').children('p.isaok').addClass('active');
                isValid.username = true;
                //userInput.select();
              }
            })
            .fail(function(jqXHR, textStatus){
              console.log( "Email availibility check failed: " + textStatus );
            });
        });
      },

      'inputUsername' : function checkUsername() {
        defaultValidate('inputUsername', validation.getErrorUsername,
          function usernameServerCheck(elem) {
            $.ajax('/username_available/?username=' + elem.val())
            .done(function(reply) {
              if (!! reply.err) {
                elem.siblings('div.sidetip').children('p.' + reply.err).addClass('active');
              } else {
                elem.siblings('div.sidetip').children('p.isaok').addClass('active');
                isValid.username = true;
              }
            })
            .fail(function(jqXHR, textStatus) {
            });
        });
      },

      'inputPassword' : function checkPassword() {
        defaultValidate('inputPassword', validation.getErrorPassword,
          function repeatPassword(elem) {
            elem.siblings('div.sidetip').children('p.isaok').addClass('active');
            isValid.password = true;
            var repeat = $('#inputRepeatPassword');
            var err = validation.getErrorPasswordRepeat(repeat.val(), elem.val());
            repeat.siblings('div.sidetip').children().removeClass('active');
            var isErr = !! err;
            repeat.siblings('div.sidetip')
              .children('p.' + (isErr ? err : 'isaok')).addClass('active');
            isValid.passwordRepeat = isErr;
        });
      },

      'inputRepeatPassword' : function checkPasswordRepeat() {
        isValid.passwordRepeat = false;
        var elem = $('#inputRepeatPassword');
        elem.val($.trim(elem.val()));
        var err = validation.getErrorPasswordRepeat(elem.val(),
          $('#inputPassword').val());
        elem.siblings('div.sidetip').children().removeClass('active');
        if (!! err) {
          elem.siblings('div.sidetip').children('p.'+err).addClass('active');
        } else {
          elem.siblings('div.sidetip').children('p.isaok').addClass('active');
          isValid.passwordRepeat = true;
        }
      }
    };

    var isValid = {
      'inputFirstname'      : false,
      'inputLastname'       : false,
      'inputEmail'          : false,
      'inputUsername'       : false,
      'inputPassword'       : false,
      'inputRepeatPassword' : false
    };

    var timer = {
      'inputFirstname'      : null,
      'inputLastname'       : null,
      'inputEmail'          : null,
      'inputUsername'       : null,
      'inputPassword'       : null,
      'inputRepeatPassword' : null
    };

    //show tip for first input that has the autofocus attribute
    // and is currently in focus
    $('input:focus[autofocus]').siblings('div.sidetip').find('p.tip').addClass('active');
    $(document).on('focus', inputSelectors, function displaytip() {
      if (! $.trim($(this).val())) { // Don't display tip if field is dirty
        $(this).siblings('div.sidetip')
          .find('p.tip').addClass('active')
          .siblings().removeClass('active');
      }
    });

    // Check after a while on input.
    $(document).on('input', inputSelectors, function onInput(evt) {
      var id = evt.target.id;
      clearTimeout(timer[id]);
      timer[id] = setTimeout(function(){
        if (_.isFunction(validate[id])) {
          validate[id]();
        }
      }, 200);
    });

    //Check imediately on leave.
    $(document).on('blur', inputSelectors, function onLeave(evt){
      var id = evt.target.id;
      clearTimeout(timer[id]);
      if (_.isFunction(validate[id])) {
        validate[id]();
      }
    });

    // Prevent submission on enter if inputs are not all valid
    $(document).keydown(function checkBeforeSubmit(evt) {
      if(evt.keyCode == 13 && !validationFunction()) {
        evt.preventDefault();
        return false;
      }
    });

    $(document).on('click', '#createAccount', function checkBeforeSubmit (evt) {
      if(! validationFunction()) {
        evt.preventDefault();
        bounce($('#createAccount'));
        return false;
      }
    });

   function bounce(elem) {
    console.log('boucing');
    bounceOnce(elem, -15, 100, function(){
      bounceOnce(elem, -10, 75);
    });

    function bounceOnce(elem, distance, duration, cb){
      elem.animate({ left: "-=" + distance, position: 'aboslute' }, duration, function onAnim1() {
        elem.animate({ left: "+=" + distance, position: 'aboslute' }, 150, function onAnim2() {
          if(!!cb && _.isFunction(cb)) {
            cb();
          }
        });
      });
    }
  }

    // Default validation handling for inputs
    // @param {String} id - the id of the input to validate
    // @param {Function} checkFn - the function to validate the input.
    //   It should return an error string or null.
    // @param {Function} cb - a callback to call if there is no error.
    function defaultValidate(id, checkFn, cb) {
      isValid[id] = false;
      var elem = $('#' + id);
      elem.val($.trim(elem.val()));
      var err = checkFn(elem.val());
      elem.siblings('div.sidetip').children().removeClass('active');
      if (!! err) {
        elem.siblings('div.sidetip').children('p.' + err).addClass('active');
      } else if (cb && (typeof(cb) == "function")) {
        cb(elem);
      } else {
        elem.siblings('div.sidetip').children('p.isaok').addClass('active');
        isValid[id] = true;
      }
    }

    function validationFunction(){
      for (var key in isValid) {
        if (!isValid[key]) {
          return false;
        }
      }
      return true;
    }
  });
} // end of signupFormBinder