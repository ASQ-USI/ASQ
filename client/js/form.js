/*
* This works a little bit like this: you can call from an external module
* <pre>forms.setup(viewName)</pre> and the setup function will search for
* a <pre>viewName</pre> property in the binders and, if it's a function, 
* it will call it. This way you can specify form logic per view
*/

'use strict'
var $ = require('jQuery')
, validation = require('../../shared/validation');


var binders = {
  'signup' : signupFormBinder,
}

function setup(viewName){
  if (binders.hasOwnProperty(viewName) && typeof binders[viewName] == 'function'){
    binders[viewName]();
  }else{
    console.log("No Form Bindings for "+ viewName);
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

    //show tip for first input that has the autofocus attribute
    // and is currently in focus
    $('input:focus[autofocus]').siblings('div.sidetip').find('p.tip').addClass('active')
    $(document).on('focus', inputSelectors, function displaytip() {
      if (! $.trim($(this).val())) { // Don't display tip if field is dirty
        $(this).siblings('div.sidetip')
          .find('p.tip').addClass('active')
          .siblings().removeClass('active');
      }
    });

    var check = {};
    check.firstname = {};
    check.firstname.valid = false;
    check.firstname.fn = function checkFirstname(evt) {
      console.log('Firstname trigger check');
      var delay = 0;
      var nav = false;
      if (!!evt) {
        evt.preventDefault();
        var key = evt.keyCode || evt.which;
        if (key === 13 || key === 9) {
          nav = true;
          console.log('SET NAV');
        } else if (evt.type !== 'blur') {
          console.log('DELAY');
          delay = 1000;
        }
      }
      check.firstname.valid = false;
      this.timer = basicCheck(evt, $(this), this.timer,
        validation.getErrorFirstname, delay, function onBasicFirstname(elem) {
          elem.siblings('div.sidetip').children('p.isaok').addClass('active');
          check.firstname.valid = true;
          check.update();
          if (nav) {
            handleNav(elem);
          }
        });
      return false;
    };
    check.lastname = {};
    check.lastname.valid = false;
    check.lastname.fn = function checkLastname(evt) {
      var delay = 0;
      var nav = false;
      if (!!evt) {
        evt.preventDefault();
        var key = evt.keyCode || evt.which;
        if (key === 13 || key === 9) {
          nav = true;
        } else if (evt.type !== 'blur') {
          console.log('DELAY');
          delay = 1000;
        }
      }
      check.lastname.valid = false;
      this.timer = basicCheck(evt, $(this), this.timer,
        validation.getErrorFirstname, delay, function onBasicLastname(elem) {
          elem.siblings('div.sidetip').children('p.isaok').addClass('active');
          check.lastname.valid = true;
          check.update();
          if (nav) {
            handleNav(elem);
          }
        });
      return false;
    };
    check.email = {};
    check.email.valid = false;
    check.email.fn = function checkEmail(evt) {
      var delay = 0;
      var nav = false;
      if (!!evt) {
        evt.preventDefault();
        var key = evt.keyCode || evt.which;
        if (key === 13 || key === 9) {
          nav = true;
        } else if (evt.type !== 'blur') {
          console.log('DELAY');
          delay = 1000;
        }
      }
      check.email.valid = false;
      this.timer = basicCheck(evt, $(this), this.timer,
        validation.getErrorEmail, delay, function onBasicCheckEmail(elem) {
          $.ajax('/email_available/?email=' + elem.val())
          .done(function(reply) {
            if (reply.blank) {
              elem.siblings('div.sidetip').children('p.blank').addClass('active');
            } else if (reply.invalid) {
              elem.siblings('div.sidetip').children('p.invalid').addClass('active');
            } else if (reply.taken) {
              elem.siblings('div.sidetip').children('p.taken').addClass('active');
            } else {
              elem.siblings('div.sidetip').children('p.isaok').addClass('active');
              check.email.valid = true;
              check.update();
            }
            // Set username from email
            if (!! reply.username && ! $('#inputUsername').val()) {
              var userInput = $('#inputUsername');
              userInput.val(reply.username);
              userInput.siblings('div.sidetip').children().removeClass('active');
              userInput.siblings('div.sidetip').children('p.isaok').addClass('active');
              check.username.valid = true;
              check.update();
            }
            if (nav) {
              handleNav(elem);
            }
          })
          .fail(function(jqXHR, textStatus){
            console.log( "Email availibility check failed: " + textStatus );
          });
      });
      return false;
    };
    check.username = {};
    check.username.valid = false;
    check.username.fn = function checkUsername(evt) {
      var delay = 0;
      var nav = false;
      if (!!evt) {
        evt.preventDefault();
        var key = evt.keyCode || evt.which;
        if (key === 13 || key === 9) {
          nav = true;
        } else if (evt.type !== 'blur') {
          console.log('DELAY');
          delay = 1000;
        }
      }
      check.username.valid = false;
      this.timer = basicCheck(evt, $(this), this.timer,
        validation.getErrorUsername, delay, function onBasicUsername(elem) {
          $.ajax('/username_available/?username=' + elem.val())
          .done(function(reply) {
            if (reply.blank) {
              elem.siblings('div.sidetip').children('p.blank').addClass('active');
             } else if (reply.invalid) {
              elem.siblings('div.sidetip').children('p.invalid').addClass('active');
             } else if (reply.taken) {
              elem.siblings('div.sidetip').children('p.taken').addClass('active');
             } else {
              elem.siblings('div.sidetip').children('p.isaok').addClass('active');
              check.username.valid = true;
              check.update();
            }
          })
          .fail(function(jqXHR, textStatus) {
            console.log( "Username availibility check failed: " + textStatus );
          });
        });
      return false;
    };
    check.password = {};
    check.password.valid = false;
    check.password.fn = function checkPassword(evt) {
      var delay = 0;
      var nav = false;
      if (!!evt) {
        evt.preventDefault();
        var key = evt.keyCode || evt.which;
        if (key === 13 || key === 9) {
          nav = true;
        } else if (evt.type !== 'blur') {
          console.log('DELAY');
          delay = 1000;
        }
      }
      check.password.valid = false;
      this.timer = basicCheck(evt, $(this), this.timer,
        validation.getErrorPassword, delay,
        function onBasicCheckPassword(elem) {
          elem.siblings('div.sidetip').children('p.isaok').addClass('active');
          check.password.valid = true;
          check.update();
          var repeat = $('#inputRepeatPassword');
          var err = validation.getErrorPasswordConfirm(repeat.val(), elem.val());
          repeat.siblings('div.sidetip').children().removeClass('active');
          if (!! err) {
            repeat.siblings('div.sidetip').children('p.' + err).addClass('active');
          } else {
            repeat.siblings('div.sidetip').children('p.isaok').addClass('active');
            check.passwordRepeat.valid = true;
            check.update();
          }
          if (nav) {
            handleNav(elem);
          }
      });
      return false;
    };
    check.passwordRepeat = {};
    check.passwordRepeat.valid = false;
    check.passwordRepeat.fn = function checkPasswordRepeat(evt) {
      var delay = 0;
      var nav = false;
      if (!!evt) {
        evt.preventDefault();
        var key = evt.keyCode || evt.which;
        if (key === 13 || key === 9) {
          nav = true;
        } else if (evt.type !== 'blur') {
          console.log('DELAY');
          delay = 1000;
        }
      }
      check.passwordRepeat.valid = false;
      var elem = $(this);
      clearTimeout(this.timer);
      this.timer = setTimeout(function checkField() {
        elem.val($.trim(elem.val()));
        var err = validation.getErrorPasswordConfirm(elem.val(),
          $('#inputPassword').val());
        elem.siblings('div.sidetip').children().removeClass('active');
        if (!! err) {
          elem.siblings('div.sidetip').children('p.'+err).addClass('active');
        } else {
          elem.siblings('div.sidetip').children('p.isaok').addClass('active');
          check.passwordRepeat.valid = true;
        }
        if (nav) {
          handleNav(elem);
        }
      }, delay);
      return false;
    }

    check.toCheck = ['firstname', 'lastname', 'email', 'username', 'password'
    , 'passwordRepeat'];

    check.update = function update() {
      var btn = $('#createAccount');
      for (var i in check.toCheck) {
        var key = check.toCheck[i];
        if (!check[key].valid) {
          if (! btn.hasClass('disabled')) {
            btn.addClass('disabled')
          }
          return false;
        }
      }
      btn.removeClass('disabled');
      return true;
    }

    function validationFunction(){
      return true;
    }

    $(window).keydown(function(event){
      if( (event.keyCode == 13) && (validationFunction() == false) ) {
        console.log('I won\'t submit');
        event.preventDefault();
        return false;
      }
    });

    $(document).on('blur' , inputSelectors, function(event){
      if(validationFunction()){
        $('#createAccount').removeClass('disabled');
        return;
      }
      $('#createAccount').addClass('disabled')
    });


    //Handle navigation keys such as tab and enter
    // $(inputSelectors).bind('keydown keypress',
    //   function handleNavKey(evt) {
    //     var key = evt.keyCode || evt.which;
    //     if (key === 13 || key === 9) {
    //       evt.preventDefault();
    //       console.log('BLOCK');
    //       // var e = $.Event('keyup');
    //       // e.keyCode = key;
    //       // console.log('TRIGGER');
    //       // console.dir(e);
    //       // console.log('ON ' + evt.target.id);
    //       // console.log($('#'+evt.target.id));
    //       // $('#'+evt.target.id).trigger(e);
    //     }
    //     return true;
    // });

    function handleNav(elem, key) {
      console.log('NAV');
      var inputs = $(inputSelectors);
      var idx = (inputs.index($(this))+1) % inputs.length;
      console.log('IDX ' + idx);
      if (idx === 0 && key === 13 && check.update()) {
        var next = $('#createAccount');
        next.click(); //submission
      } else {
        var next = inputs[idx];
        next.focus();
        next.select();
      }
      return false;
    }

    // call checkField after a delay and return the timer
    function basicCheck(evt, elem, timer, checkFn, delay, cb) {
      clearTimeout(timer);
      // if (!! evt) {
      //   var key = evt.keyCode || evt.which;
      //   if (key === 13 || key === 9) {
      //     return false;
      //   }
      // }
      return setTimeout(checkField, delay);

      // check value of elem with checkFn and call cb if all is ok.
      function checkField() {
        console.log('CHECK')
        console.log(elem);
        elem.val($.trim(elem.val()));
        var err = checkFn(elem.val());
        elem.siblings('div.sidetip').children().removeClass('active');
        if (!! err) {
          elem.siblings('div.sidetip').children('p.' + err).addClass('active');
        } else if (cb && (typeof(cb) == "function")) {
          cb(elem);
        }
      }
    }

    // TODO: move all of this to one document listener

    // Validations for first name
    // $('#inputFirstname').on('keyup blur', check.firstname.fn);

    // // Validations for last name
    // $('#inputLastname').on('keyup blur', check.lastname.fn);

    // // Validations for email
    // $('#inputEmail').on('keyup blur', check.email.fn);

    // // Validations for username
    // $('#inputUsername').on('keyup blur', check.username.fn);

    // // Validations for password
    // $('#inputPassword').on('keyup blur', check.password.fn);

    // // Validations for repeat password
    // $('#inputRepeatPassword').on('keyup blur', check.passwordRepeat.fn);
  });
} /* end of signupFormBinder  */