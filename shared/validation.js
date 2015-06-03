var validator = require('validator');

module.exports = {

  getErrorFirstname : function (candidate) {
    if (validator.isNull(candidate)) {
      return 'blank';
    }
    if (!validator.isLength(candidate, 1, 20)) {
      return 'invalid';  }
    return null;
  },

  getErrorLastname : function (candidate) {
    if (validator.isNull(candidate)) {
      return 'blank';
    }
    if (!validator.isLength(candidate, 1, 20)) {
      return 'invalid';
    }
    return null;
  },

  getErrorEmail : function (candidate) {
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
  },

  getErrorUsername : function (candidate) {
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
  },

  getErrorCurrentPassword : function (candidate) {
    if (validator.isNull(candidate)) {
      return 'blank';
    }

    return null;
  },

  getErrorPassword : function (candidate) {
    if (validator.isNull(candidate)) {
      return 'blank';
    }
    if (!validator.matches(candidate,
        '(?=^.{8,50}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s)[0-9a-zA-Z:!@#%_\\(\\)\\$\\^\\&\\*\\-\\.\\?]*$'
        )) {
      return 'invalid';
    }
    return null;
  },

  getErrorPasswordRepeat : function (candidate, password) {
    if (validator.isNull(candidate)) {
      return 'blank';
    }
    if (!validator.equals(candidate, password)) {
      return 'mismatch';
    }
    return null;
  },

  /**
   *  Validation of the form data from the signup form.
   *  @param {object} data - the form data. Expects to have the following {string}
   *  attributes: firstname, lastname, email, username, password, passwordRepeat.
   */
  getErrorsSignup : function (data) {
    var err = {};
    err.fistname       = this.getErrorFirstname(data.firstname);
    err.lastname       = this.getErrorLastname(data.lastname);
    err.email          = this.getErrorEmail(data.email);
    err.username       = this.getErrorUsername(data.username);
    err.password       = this.getErrorPassword(data.password);
    err.passwordRepeat = this.getErrorPasswordRepeat(data.passwordRepeat, data.password);
    return err;
  },

  /**
   *  Validation of the form data from the user update form.
   *  @param {object} data - the form data. Expects to have the following {string}
   *  attributes: firstname, lastname, email, username, password, passwordRepeat.
   */
  getErrorsUpdateUser : function (data) {
    // .. well they have the same fields
    return this.getErrorsSignup(data);
  },

  /**
   *  Validation of the form data from the campus signup form.
   *  @param {object} data - the form data. Expects to have the following {string}
   *  attributes: firstname, lastname, email, username, password, passwordRepeat.
   */
  getErrorsSignupCampus : function (data) {
    var err = {};
    err.username = this.getErrorUsername(data.username);
    return err;
  }
}
