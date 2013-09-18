/*
* This works a little bit like this: you can call from an external module
* <pre>forms.setup(viewName)</pre> and the setup function will search for
* a <pre>viewName</pre> property in the binders and, if it's a function, 
* it will call it. This way you can specify form logic per view
*/

'use strict'
var $ = require('jQuery')


var binders = {
  'signIn' : signInFormBinder,
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

//signin form
function signInFormBinder(){
  var iconOkHtml = '<i class="icon-ok"></i>'
    , usernameOk  = false
    , emailOk    = false
    , pwdOk      = false;

  var validators = {
    'inputUsername'       : checkUsername,
    'inputEmail'          : validateMail,
    'inputRepeatPassword' : validatePassword
  };

  function checkAllOk() {
    if (pwdOk && emailOk && usernameOk) {

      $('#createAccount')
        .removeClass('disabled')
        .disabled = false;
    } else {
      $('#createAccount')
        .addClass('disabled')
        .disabled = true;
    }
  }

  function checkUsername () {
    usernameOk = false;
    var username = $.trim($("#inputUsername").val());

    if (username == '') {
      $('#checkuser').html('');
      checkAllOk();
      return false;
    }

    $.ajax('/checkusername/' + username + '/')
      .done(function(reply){
         switch (reply){
          case '0':
            $('#checkuser').html(iconOkHtml);
            $('#groupUsername').removeClass('error');
            usernameOk = true;
            break;
          case '1':
            $('#checkuser').html('Not available');
            $('#groupUsername').addClass('error');
            break;
          case '2':
            $('#checkuser').html('Invalid name')
            $('#groupUsername').addClass('error');
            break;
        }
        checkAllOk();
      })
      .fail(function(jqXHR, textStatus){
        console.log( "Check username failed: " + textStatus );
      })
    return false;  
  }

  function validateMail() {

    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    var address = $('#inputEmail').val();
    if (reg.test(address) == false) {

      $('#checkmail').html('Not valid');
      $('#groupEmail').addClass('error');
      emailOk = false;
    } else {
      $('#checkmail').html(iconOkHtml);
      $('#groupEmail').removeClass('error');
      emailOk = true;
    }
    checkAllOk();
  }

  function validatePassword() {

    var pwd1 = $('#inputPassword').val()
      , pwd2 = $('#inputRepeatPassword').val();

    if (pwd1 === pwd2) {
      $('#checkpwd').html(iconOkHtml);
      $('#checkpwd2').html(iconOkHtml);
      $('#groupPassword1').removeClass('error');
      $('#groupPassword2').removeClass('error');
      pwdOk = true;
    } else {
      $('#checkpwd').html(' ');
      $('#checkpwd2').html('Mismatch!');
      $('#groupPassword1').addClass('error');
      $('#groupPassword2').addClass('error');
      pwdOk = false;
    }
    checkAllOk();
  }

  $(function(){
    var inputSelectors = 'input[type=text], input[type=email], input[type=password]';

    //in case the browser autcompletes
    setTimeout(function(){
      $(inputSelectors).each(function(){
        if ($.trim($(this).val()) !='') $(this).trigger('keyup.asq.signin')
      })
    }, 500)
    
    $('#signup').on('keyup.asq.signin', inputSelectors, function(event){
        var id = event.target.id;
        if (validators.hasOwnProperty(id) 
          && 'function' == typeof(validators[id]))  validators[id]();
      });

    $('#createAccount').on('click.asq.signin', function(event) {
      event.preventDefault()
      if ($(this).hasClass('disabled')) return;
      $('#signup').submit();
    })
  });

} /* end of signInFormBinder */