var check            = require('validator').check
  , reservedKeywords = require('../keywords')
  , errorMessages    = require('../error-messages');

function isValidUserForm(username, email, password, passwordConfirm, strict) {
  var strict = typeof(strict) != 'boolean' ? true : strict;

  var errors = null;
  // Username syntax
  try {
    check(username, errorMessages.username)
      .notEmpty()
      .notNull()
      .notIn(reservedKeywords)
      .regex('(?=[a-zA-Z])(?=^.{3,12}$)[a-zA-Z0-9_\\-\.]*$');
  } catch (err) {
    var registerError = strict
        || err.message !== errorMessages.username.notEmpty
        || err.message !== errorMessages.username.notNull;
    if (registerError) {
      if (errors === null) {
        errors = {};
      }
      errors.username = err.message;
    }
  }
  
  // Email
  try {
    check(email, errorMessages.email)
    .notEmpty()
    .notNull()
    .len(6, 64)
    .isEmail();
  } catch (err) {
    var registerError = strict
        || err.message !== errorMessages.email.notEmpty
        || err.message !== errorMessages.email.notNull;
    if (registerError) {
      if (errors === null) {
        errors = {};
      }
      errors.email = err.message;
    }
  }

  //Password
  try {
    check(password, errorMessages.password)
    .notEmpty()
    .notNull()
    .regex(
      new RegExp(['(?=^.{8,30}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s)',
                  '[0-9a-zA-Z:!@#%_\\(\\)\\$\\^\\&\\*\\-\\.\\?]*$'].join('')
    ));
  } catch (err) {
    var registerError = strict
        || err.message !== errorMessages.password.notEmpty
        || err.message !== errorMessages.password.notNull;
    if (registerError) {
      if (errors === null) {
        errors = {};
      }
      errors.password = err.message;
    }
  }

  try {
    check(passwordConfirm, errorMessages.passwordConfirm)
    .equals(password);
  } catch (err) {
    if (errors === null) {
      errors = {};
    }
    errors.passwordConfirm = err.message;
  }

  
  return errors;
}

module.exports = {
  isValidUserForm : isValidUserForm
}