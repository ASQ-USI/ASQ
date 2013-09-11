var $ = require("jQuery")


var usernameOk = false;
var emailOk = false;
var pwdOk = false;

// var isValidUserName = function(candidateUser) {
//   // Match string between 3 and 12 chars starting with a letter, lower or upper case 
//   // and containing only letters (both cases, digits, dashes, underscores and dots.
//   var userRegex = /(?=[a-zA-Z])(?=^.{3,12}$)[a-zA-Z0-9_\-\.]*$/;
//   return userRegex.test(candidateUser);

// }

// var isValidPassword = function(candidatePass) {
//   // Match a string between 8 and 30 chars
//   // and containing only letters (both cases), digits and the following characters: ! @ # % : _ ( ) $ ^ & * - . ?
//   // It also must contain at least one upper case letter, one lower case and one digit and it cannot contain spaces.
//   var passwordRegex = /(?=^.{8,30}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z:!@#%_\(\)\$\^\&\*\-\.\?]*$/;
//   return passwordRegex.test(candidatePass);
// }


function checkUsername (input) {
  var username = input.value;
  if (username != '') {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/checkusername/' + username + '/', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status == 200) {
        var html = [];
        var reply = xhr.responseText;
        if (reply == 1) {
          $('#checkuser').html('Not available');
          $('#groupUsername').attr('class', 'control-group error');
          usernameOk = false;

        } else if (reply == 2) {
          $('#checkuser').html('Invalid name')
          $('#groupUsername').attr('class', 'control-group error');
          usernameOk = false;
        } else {
          $('#checkuser').html('<i class="icon-ok"></i>');
          $('#groupUsername').attr('class', 'control-group');
          usernameOk = true;
        }
      }
    }
    checkAllOk();
    xhr.send(null);
    return false;
  } else {
    $('#checkuser').html('');
  }
  checkAllOk();
}

function validateMail() {

  var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  var address = $('#inputEmail').value;
  if (reg.test(address) == false) {

    $('#checkmail').html('Not valid');
    $('#groupEmail').attr('class', 'control-group error');
    emailOk = false;
  } else {
    $('#checkmail').html('<i class="icon-ok"></i>');
    $('#groupEmail').attr('class', 'control-group');
    emailOk = true;
  }
  checkAllOk();
}

function validatePassword() {

  var pwd1 = $('#inputPassword').value;
  var pwd2 = $('#inputRepeatPassword').value;

  if (pwd1 === pwd2) {
    $('#checkpwd').html('<i class="icon-ok"></i>');
    $('#checkpwd2').html('<i class="icon-ok"></i>');
    $('#groupPassword1').attr('class', 'control-group');
    $('#groupPassword2').attr('class', 'control-group');
    pwdOk = true;
  } else {
    $('#checkpwd').html(' ');
    $('#checkpwd2').html('Mismatch!');
    $('#groupPassword1').attr('class', 'control-group error');
    $('#groupPassword2').attr('class', 'control-group error');
    pwdOk = false;
  }
  checkAllOk();
}

function checkAllOk() {
  if (pwdOk && emailOk && usernameOk) {

    $('#createAccount').removeClass('disabled');
    $('#createAccount').disabled = false;
  } else {
    $('#createAccount').addClass('disabled');
    $('#createAccount').disabled = true;
  }
}




var form = module.exports = {
    checkAllOk       : checkAllOk,
    checkUsername    : checkUsername,
    validateMail     : validateMail,
    validatePassword : validatePassword
}