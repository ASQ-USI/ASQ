/*
* This works a little bit like this: you can call from an external module
* <pre>forms.setup(viewName)</pre> and the setup function will search for
* a <pre>viewName</pre> property in the binders and, if it's a function, 
* it will call it. This way you can specify form logic per view
*/

'use strict'
var $        = require('jquery')
, _          = require ('lodash')
, effects    = require('./effects')
, validation = require('../../shared/validation');


var binders = {
  'completeRegistration' : completeRegistrationFormBinder,
  'signup' : signupFormBinder,
  'userSettings' : userSettingsFormBinder
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

//signup form
function userSettingsFormBinder(){

  $(function(){
    var userId = document.getElementById('user-settings-form').dataset.userId;
    var inputSelectors = 'input[type=text], input[type=email], input[type=password]';

    var validateFn = {
      'inputFirstname' : function checkFirstname() {
        defaultValidate('inputFirstname', validation.getErrorFirstname);
      },

      'inputLastname' : function checkLastname() {
        defaultValidate('inputLastname', validation.getErrorLastname);
      },

      'inputEmail' : function checkEmail() {
        defaultValidate('inputEmail', validation.getErrorEmail,
          function emailServerCheck(err, $el) {
            if (!! err) {
              $el.siblings('div.sidetip').children('p.' + err).addClass('active');
              return;
            }
            $.ajax('/email_available/?email=' + $el.val().toLowerCase() + '&excludeUser=' + userId )
            .done(function(reply) {
              if (!!reply.err) {
                $el.siblings('div.sidetip').children('p.' + reply.err).addClass('active');
              } else {
                $el.siblings('div.sidetip').children('p.isaok').addClass('active');
                isValid.inputEmail = true;
              }
              // Set username from email
              if (!!reply.username && !$('#inputUsername').val()) {
                var userInput = $('#inputUsername');
                //username should be up to 64 chars from the email validation
                userInput.val(reply.username);
                userInput.siblings('div.sidetip').children().removeClass('active');
                userInput.siblings('div.sidetip').children('p.isaok').addClass('active');
                isValid.inputUsername = true;
              }
            })
            .fail(function(jqXHR, textStatus){
              console.log( "Email availibility check failed: " + textStatus );
            });
        });
      },

      'inputUsername' : function checkUsername() {
        defaultValidate('inputUsername', validation.getErrorUsername,
          function usernameServerCheck(err, $el) {
            if (!! err) {
              $el.siblings('div.sidetip').children('p.' + err).addClass('active');
              return;
            }
            $.ajax('/username_available/?username=' + $el.val() + '&excludeUser=' + userId )
            .done(function(reply) {
              if (!! reply.err) {
                $el.siblings('div.sidetip').children('p.' + reply.err).addClass('active');
              } else {
                $el.siblings('div.sidetip').children('p.isaok').addClass('active');
                isValid.inputUsername = true;
              }
            })
            .fail(function(jqXHR, textStatus) {
              console.log( "Username availibility check failed: " + textStatus );
            });
        });
      },

      'inputCurrentPassword' : function checkPassword() {
        defaultValidate('inputCurrentPassword', validation.getErrorCurrentPassword);
      },

      'inputPassword' : function checkPassword() {
        defaultValidate('inputPassword', validation.getErrorPassword,
          function repeatPassword(err, $el) {
            if (!! err) {
              $el.siblings('div.sidetip').children('p.' + err).addClass('active');
            } else {
              $el.siblings('div.sidetip').children('p.isaok').addClass('active');
              isValid.inputPassword = true;
            }
            var repeat = $('#inputRepeatPassword');
            var errRepeat = validation.getErrorPasswordRepeat(repeat.val(), $el.val());
            repeat.siblings('div.sidetip').children().removeClass('active');
            var isErr = !! errRepeat;
            repeat.siblings('div.sidetip')
              .children('p.' + (isErr ? errRepeat : 'isaok')).addClass('active');
            isValid.inputRepeatPassword = isErr;
        });
      },

      'inputRepeatPassword' : function checkPasswordRepeat() {
        isValid.inputRepeatPassword = false;
        var $el = $('#inputRepeatPassword');
        $el.val($.trim($el.val()));
        var err = validation.getErrorPasswordRepeat($el.val(),
          $('#inputPassword').val());
        $el.siblings('div.sidetip').children().removeClass('active');
        if (!! err) {
          $el.siblings('div.sidetip').children('p.'+err).addClass('active');
        } else {
          $el.siblings('div.sidetip').children('p.isaok').addClass('active');
          isValid.inputRepeatPassword = true;
        }
      }
    };

    var isValid = {
      'inputFirstname'      : false,
      'inputLastname'       : false,
      'inputEmail'          : false,
      'inputUsername'       : false,
      'inputCurrentPassword': false,
      'inputPassword'       : false,
      'inputRepeatPassword' : false
    };

    var timer = {
      'inputFirstname'      : null,
      'inputLastname'       : null,
      'inputEmail'          : null,
      'inputUsername'       : null,
      'inputCurrentPassword': false,
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
    $(document).on('input keypress', inputSelectors, function onInput(evt) {
      var id = evt.target.id;
      clearTimeout(timer[id]);
      timer[id] = setTimeout(function(){
        if (_.isFunction(validateFn[id])) {
          validateFn[id]();
        }
      }, 200);
    });

    //Check imediately on leave.
    $(document).on('blur', inputSelectors, function onLeave(evt){
      var id = evt.target.id;
      clearTimeout(timer[id]);
      if (_.isFunction(validateFn[id])) {
        validateFn[id]();
      }
    });

    // Prevent submission on enter if inputs are not all valid.
    $(document).keydown(function checkBeforeSubmit(evt) {
      if(evt.keyCode == 13 && !validationFunction()) {
        evt.preventDefault();
        effects.bounce($('#saveChangesBtn'));
        return false;
      }
    });

    // Prevent submission on click if inputs are not all valid.
    $(document).on('click', '#saveChangesBtn', function checkBeforeSubmit (evt) {
      if(! validationFunction()) {
        evt.preventDefault();
        effects.bounce($(this));
        return false;
      }
    });

    // Default validation handling for inputs
    // @param {String} id - the id of the input to validate
    // @param {Function} checkFn - the function to validate the input.
    //   It should return an error string or null.
    // @param {Function} cb - a callback to call if there is no error.
    function defaultValidate(id, checkFn, cb) {
      isValid[id] = false;
      var $el = $('#' + id);
      $el.val($.trim($el.val()));
      var err = checkFn($el.val());
      $el.siblings('div.sidetip').children().removeClass('active');
      if (!!cb && _.isFunction(cb)) {
        cb(err, $el);
      } else if (!! err) {
        $el.siblings('div.sidetip').children('p.' + err).addClass('active');
      } else {
        $el.siblings('div.sidetip').children('p.isaok').addClass('active');
        isValid[id] = true;
      }
    }

    // Assert all fields are valid.
    function validationFunction(){
      for (var key in isValid) {
        if (isValid.hasOwnProperty(key) && !isValid[key]) {
          return false;
        }
      }
      return true;
    }
  });
} // end of userSettingsFormBinder

//signup form
function signupFormBinder(){

  $(function(){
    var inputSelectors = 'input[type=text], input[type=email], input[type=password]';

    var hasTypedPasswordRepeat = false;

    var validateFn = {
      'inputFirstname' : function checkFirstname() {
        defaultValidate('inputFirstname', validation.getErrorFirstname);
      },

      'inputLastname' : function checkLastname() {
        defaultValidate('inputLastname', validation.getErrorLastname);
      },

      'inputEmail' : function checkEmail() {
        defaultValidate('inputEmail', validation.getErrorEmail,
          function emailServerCheck(err, $el) {
            if (!! err) {
              $el.siblings('div.sidetip').children('p.' + err).addClass('active');
              return;
            }
            $.ajax('/email_available/?email=' + $el.val().toLowerCase())
            .done(function(reply) {
              if (!!reply.err) {
                $el.siblings('div.sidetip').children('p.' + reply.err).addClass('active');
              } else {
                $el.siblings('div.sidetip').children('p.isaok').addClass('active');
                isValid.inputEmail = true;
              }
              // Set username from email
              if (!!reply.username && !$('#inputUsername').val()) {
                var userInput = $('#inputUsername');
                userInput.val(reply.username);
                userInput.siblings('div.sidetip').children().removeClass('active');
                userInput.siblings('div.sidetip').children('p.isaok').addClass('active');
                isValid.inputUsername = true;
              }
            })
            .fail(function(jqXHR, textStatus){
              console.log( "Email availibility check failed: " + textStatus );
            });
        });
      },

      'inputUsername' : function checkUsername() {
        defaultValidate('inputUsername', validation.getErrorUsername,
          function usernameServerCheck(err, $el) {
            if (!! err) {
              $el.siblings('div.sidetip').children('p.' + err).addClass('active');
              return;
            }
            $.ajax('/username_available/?username=' + $el.val())
            .done(function(reply) {
              if (!! reply.err) {
                $el.siblings('div.sidetip').children('p.' + reply.err).addClass('active');
              } else {
                $el.siblings('div.sidetip').children('p.isaok').addClass('active');
                isValid.inputUsername = true;
              }
            })
            .fail(function(jqXHR, textStatus) {
              console.log( "Username availibility check failed: " + textStatus );
            });
        });
      },

      'inputPassword' : function checkPassword() {
        defaultValidate('inputPassword', validation.getErrorPassword,
          function repeatPassword(err, $el) {
            if (!! err) {
              $el.siblings('div.sidetip').children('p.' + err).addClass('active');
            } else {
              $el.siblings('div.sidetip').children('p.isaok').addClass('active');
              isValid.inputPassword = true;
            }

            // do not validate confirm password if the user hasn't typed anything
            if(!hasTypedPasswordRepeat) return;

            var repeat = $('#inputRepeatPassword');
            var errRepeat = validation.getErrorPasswordRepeat(repeat.val(), $el.val());
            repeat.siblings('div.sidetip').children().removeClass('active');
            var isErr = !! errRepeat;
            repeat.siblings('div.sidetip')
              .children('p.' + (isErr ? errRepeat : 'isaok')).addClass('active');
            isValid.inputRepeatPassword = isErr;
        });
      },

      'inputRepeatPassword' : function checkPasswordRepeat() {
        hasTypedPasswordRepeat = true;
        isValid.inputRepeatPassword = false;
        var $el = $('#inputRepeatPassword');
        $el.val($.trim($el.val()));
        var err = validation.getErrorPasswordRepeat($el.val(),
          $('#inputPassword').val());
        $el.siblings('div.sidetip').children().removeClass('active');
        if (!! err) {
          $el.siblings('div.sidetip').children('p.'+err).addClass('active');
        } else {
          $el.siblings('div.sidetip').children('p.isaok').addClass('active');
          isValid.inputRepeatPassword = true;
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
    $(document).on('input keypress', inputSelectors, function onInput(evt) {
      var id = evt.target.id;
      clearTimeout(timer[id]);
      timer[id] = setTimeout(function(){
        if (_.isFunction(validateFn[id])) {
          validateFn[id]();
        }
      }, 200);
    });

    //Check imediately on leave.
    $(document).on('blur', inputSelectors, function onLeave(evt){
      var id = evt.target.id;
      clearTimeout(timer[id]);
      if (_.isFunction(validateFn[id])) {
        validateFn[id]();
      }
    });

    // Prevent submission on enter if inputs are not all valid.
    $(document).keydown(function checkBeforeSubmit(evt) {
      if(evt.keyCode == 13 && !validationFunction()) {
        evt.preventDefault();
        effects.bounce($('#createAccount'));
        return false;
      }
    });

    // Prevent submission on click if inputs are not all valid.
    $(document).on('click', '#createAccount', function checkBeforeSubmit (evt) {
      if(! validationFunction()) {
        evt.preventDefault();
        effects.bounce($(this));
        return false;
      }
    });

    // Default validation handling for inputs
    // @param {String} id - the id of the input to validate
    // @param {Function} checkFn - the function to validate the input.
    //   It should return an error string or null.
    // @param {Function} cb - a callback to call if there is no error.
    function defaultValidate(id, checkFn, cb) {
      isValid[id] = false;
      var $el = $('#' + id);
      $el.val($.trim($el.val()));
      var err = checkFn($el.val());
      $el.siblings('div.sidetip').children().removeClass('active');
      if (!!cb && _.isFunction(cb)) {
        cb(err, $el);
      } else if (!! err) {
        $el.siblings('div.sidetip').children('p.' + err).addClass('active');
      } else {
        $el.siblings('div.sidetip').children('p.isaok').addClass('active');
        isValid[id] = true;
      }
    }

    // Assert all fields are valid.
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


//complete registration form
function completeRegistrationFormBinder(){

  $(function(){
    var inputSelectors = 'input[type=text]';

    var validateFn = {

      'inputUsername' : function checkUsername() {
        defaultValidate('inputUsername', validation.getErrorUsername,
          function usernameServerCheck(err, $el) {
            if (!! err) {
              $el.siblings('div.sidetip').children('p.' + err).addClass('active');
              return;
            }
            $.ajax('/username_available/?username=' + $el.val())
            .done(function(reply) {
              if (!! reply.err) {
                $el.siblings('div.sidetip').children('p.' + reply.err).addClass('active');
              } else {
                $el.siblings('div.sidetip').children('p.isaok').addClass('active');
                isValid.inputUsername = true;
              }
            })
            .fail(function(jqXHR, textStatus) {
              console.log( "Username availibility check failed: " + textStatus );
            });
        });
      }
    };

    var isValid = {'inputUsername' : false }
      , timer = {'inputUsername' : null };

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

    //validate pre-filled fields
    $(inputSelectors).each(function(){
      if ($(this).val()){
        if (_.isFunction(validateFn[this.id])) {
          validateFn[this.id]();
        }
      }
    });

    // Check after a while on input.
    $(document).on('input keypress', inputSelectors, function onInput(evt) {
      var id = evt.target.id;
      clearTimeout(timer[id]);
      timer[id] = setTimeout(function(){
        if (_.isFunction(validateFn[id])) {
          validateFn[id]();
        }
      }, 200);
    });

    //Check imediately on leave.
    $(document).on('blur', inputSelectors, function onLeave(evt){
      var id = evt.target.id;
      clearTimeout(timer[id]);
      if (_.isFunction(validateFn[id])) {
        validateFn[id]();
      }
    });

    // Prevent submission on enter if inputs are not all valid.
    $(document).keydown(function checkBeforeSubmit(evt) {
      if(evt.keyCode == 13 && !validationFunction()) {
        evt.preventDefault();
        effects.bounce($('#completeRegistrationSbmt'));
        return false;
      }
    });

    // Prevent submission on click if inputs are not all valid.
    $(document).on('click', '#completeRegistrationSbmt', function checkBeforeSubmit (evt) {
      if(! validationFunction()) {
        evt.preventDefault();
        effects.bounce($(this));
        return false;
      }
    });

    // Default validation handling for inputs
    // @param {String} id - the id of the input to validate
    // @param {Function} checkFn - the function to validate the input.
    //   It should return an error string or null.
    // @param {Function} cb - a callback to call if there is no error.
    function defaultValidate(id, checkFn, cb) {
      isValid[id] = false;
      var $el = $('#' + id);
      $el.val($.trim($el.val()));
      var err = checkFn($el.val());
      $el.siblings('div.sidetip').children().removeClass('active');
      if (!!cb && _.isFunction(cb)) {
        cb(err, $el);
      } else if (!! err) {
        $el.siblings('div.sidetip').children('p.' + err).addClass('active');
      } else {
        $el.siblings('div.sidetip').children('p.isaok').addClass('active');
        isValid[id] = true;
      }
    }

    // Assert all fields are valid.
    function validationFunction(){
      for (var key in isValid) {
        if (!isValid[key]) {
          return false;
        }
      }
      return true;
    }
  });
} // end of completeRegistrationBinder