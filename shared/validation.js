var validator = require('validator');


function getErrorFirstname(candidate) {
  if (validator.isNull(candidate)) {
    return 'blank';
  }
  if (!validator.isLength(candidate, 1, 20)) {
    return 'invalid';  }
  return null;
}

function getErrorLastname(candidate) {
  if (validator.isNull(candidate)) {
    return 'blank';
  }
  if (!validator.isLength(candidate, 1, 20)) {
    return 'invalid';
  }
  return null;
}

function getErrorEmail(candidate) {
  if (validator.isNull(candidate)) {
    return 'blank';
  }
  if (!validator.isLength(candidate, 6, 64)) {
    return 'len';
  }
  if (!validator.isEmail(candidate)) {
    return 'invalid';
  }
  return null;
}

function getErrorUsername(candidate) {
  if (validator.isNull(candidate)) {
    return 'blank';
  }
  if (validator.isIn(candidate, [
          'signup',
          'login',
          'logout',
          'upload',
          'email_available',
          'username_available',
          'apple-touch-icon-114-precomposed.png',
          'apple-touch-icon-144-precomposed.png',
          'css',
          'favicon.ico',
          'fonts',
          'img',
          'js',
          'sampleQuestion.json',
          'startup.png',
          'stylesheets',
          'touch-icon-ipad.png',
          'touch-icon-iphone.png',
          ])) {
    return 'taken';
  }
  if (!validator.matches(candidate, '(?=[a-z])(?=^.{1,15}$)[a-z0-9_\\-\.]*$')) {
    return 'invalid';
  }
  return null;
}

function getErrorPassword(candidate) {
  if (validator.isNull(candidate)) {
    return 'blank';
  }
  if (!validator.matches(candidate,
      '(?=^.{8,50}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s)[0-9a-zA-Z:!@#%_\\(\\)\\$\\^\\&\\*\\-\\.\\?]*$'
      )) {
    return 'invalid';
  }
  return null;
}

function getErrorPasswordRepeat(candidate, password) {
  if (validator.isNull(candidate)) {
    return 'blank';
  }
  if (!validator.equals(candidate, password)) {
    return 'mismatch';
  }
  return null;
}

/**
 *  Validation of the form data from the signup form.
 *  @param {object} data - the form data. Expects to have the following {string}
 *  attributes: firstname, lastname, email, username, password, passwordRepeat.
 */
function getErrorsSignup(data) {
  var err = {};
  err.fistname       = getErrorFirstname(data.firstname);
  err.lastname       = getErrorLastname(data.lastname);
  err.email          = getErrorEmail(data.email);
  err.username       = getErrorUsername(data.username);
  err.password       = getErrorPassword(data.password);
  err.passwordRepeat = getErrorPasswordRepeat(data.passwordRepeat, data.password);
  return err;
}

/**
 *  Validation of the form data from the campus signup form.
 *  @param {object} data - the form data. Expects to have the following {string}
 *  attributes: firstname, lastname, email, username, password, passwordRepeat.
 */
function getErrorsSignupCampus(data) {
  var err = {};
  err.username = getErrorUsername(data.username);
  return err;
}

module.exports = {
  getErrorFirstname      : getErrorFirstname,
  getErrorLastname       : getErrorLastname,
  getErrorEmail          : getErrorEmail,
  getErrorUsername       : getErrorUsername,
  getErrorPassword       : getErrorPassword,
  getErrorPasswordRepeat : getErrorPasswordRepeat,
  getErrorsSignup        : getErrorsSignup,
  getErrorsSignupCampus : getErrorsSignupCampus
}
