var check            = require('validator').check
  , reservedKeywords = require('../keywords')
  , errorMessages    = require('../error-messages');


function isValidUserForm(firstname, lastname,
  email, username, password, passwordConfirm, strict) {
  var strict = typeof(strict) != 'boolean' ? true : strict;

  var errors = null;

  console.log('FORM VALIDATION')
  console.log(firstname);
  console.log(lastname);
  console.log(email);
  console.log(username);
  console.log(password);
  console.log(passwordConfirm);

  //Firstname
  //TODO better (actual) check
  try {
    check(firstname, errorMessages.firstname)
    .notEmpty()
    .notNull()
    .len(2, 64);
  } catch (err) {
    var registerError = strict
        || err.message !== errorMessages.firstname.notEmpty
        || err.message !== errorMessages.firstname.notNull;
    if (registerError) {
      if (errors === null) {
        errors = {};
      }
      errors.firstname = err.message;
    }
  }

  //Lastname
  //TODO better (actual) check
  try {
    check(lastname, errorMessages.lastname)
    .notEmpty()
    .notNull()
    .len(2, 64);
  } catch (err) {
    var registerError = strict
        || err.message !== errorMessages.lastname.notEmpty
        || err.message !== errorMessages.lastname.notNull;
    if (registerError) {
      if (errors === null) {
        errors = {};
      }
      errors.lastname = err.message;
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

  // Username syntax
  try {
    check(username, errorMessages.username)
      .notEmpty()
      .notNull()
      .notIn(reservedKeywords)
      .regex('(?=[a-z])(?=^.{3,50}$)[a-z0-9_\\-\.]*$');
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

  //Password
  try {
    check(password, errorMessages.password)
    .notEmpty()
    .notNull()
    .regex(
      new RegExp(['(?=^.{8,50}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s)',
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