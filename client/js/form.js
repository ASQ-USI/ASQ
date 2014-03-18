/*
* This works a little bit like this: you can call from an external module
* <pre>forms.setup(viewName)</pre> and the setup function will search for
* a <pre>viewName</pre> property in the binders and, if it's a function, 
* it will call it. This way you can specify form logic per view
*/

'use strict'
var $ = require('jQuery')


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
  var iconOkHtml  = '<span class="glyphings glyphings-ok"></span>'
    , firstnameOk = false
    , lastnameOk  = false
    , emailOk     = false
    , usernameOk  = false
    , pwdOk       = false;

  var validators = {
    'inputFirstname'      : validateFirstname,
    'inputLastname'       : validateLastname,
    'inputEmail'          : validateEmail,
    'inputUsername'       : checkUsername,
    'inputRepeatPassword' : validatePassword
  };

  function checkAllOk() {
    if (firstnameOk && lastnameOk && emailOk && usernameOk && pwdOk) {
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

  //TODO Validation of first and last name
  function validateFirstname() {
    firstnameOk = false;
    var firstname = $.trim($("#inputFirstname").val());
    firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
    firstnameOk = true;
    checkAllOk();
  }

  function validateLastname() {
    lastnameOk = false;
    var lastname = $.trim($("#inputLastname").val());
    lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1);
    lastnameOk = true;
    checkAllOk();
  }

  function validateEmail() {

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
        if ($.trim($(this).val()) !='') $(this).trigger('keyup.asq.signup')
      })
    }, 500)
    
    $('#signup').on('keyup.asq.signup', inputSelectors, function(event){
        var id = event.target.id;
        if (validators.hasOwnProperty(id) 
          && 'function' == typeof(validators[id]))  validators[id]();
      });

    $('#createAccount').on('click.asq.signup', function(event) {
      event.preventDefault()
      if ($(this).hasClass('disabled')) return;
      $('#signup').submit();
    })
  });

} /* end of signupFormBinder */