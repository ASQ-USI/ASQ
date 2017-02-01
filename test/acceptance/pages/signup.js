module.exports = {
  url: function() {
    return `${this.api.launchUrl}/signup`;
  },
  elements: {
    signupForm: {
      selector: 'form[action="/signup"]'
    },
    firstnameInput: {
      selector: 'input[name="signupfirstname"]'
    },
    firstnameTip: {
      selector: '#groupFirstname .sidetip p.tip'
    },
    firstnameOk: {
      selector: '#groupFirstname .sidetip p.isaok'
    },
    lastnameInput: {
      selector: 'input[name=signuplastname]'
    },
    lastnameTip: {
      selector: '#groupLastname .sidetip p.tip'
    },
    lastnameOk: {
      selector: '#groupLastname .sidetip p.isaok'
    },
    emailInput: {
      selector: 'input[name=signupemail]'
    },
    emailTip: {
      selector: '#groupemail .sidetip p.tip'
    },
    emailErrorInvalid: {
      selector: '#groupEmail .sidetip p.error.invalid'
    },
    emailOk: {
      selector: '#groupEmail .sidetip p.isaok'
    },
    usenameInput: {
      selector: 'input[name=signupusername]'
    },
    usernameOk: {
      selector: '#groupUsername .sidetip p.isaok'
    },
    passwordInput: {
      selector: 'input[name=signuppassword]'
    },
    passwordTip: {
      selector: '#groupPassword1 .sidetip p.tip'
    },
    passwordErrorInvalid: {
      selector: '#groupPassword1 .sidetip p.error.invalid'
    },
    passwordOk: {
      selector: '#groupPassword1 .sidetip p.isaok'
    },
    passwordconfirmInput: {
      selector: 'input[name=signuppasswordconfirm]'
    },
    passwordconfirmTip: {
      selector: '#groupPassword2 .sidetip p.tip'
    },
    passwordconfirmErrorMismatch: {
      selector: '#groupPassword2 .sidetip p.error.mismatch'
    },
    passwordconfirmBlankMessage: {
      selector: '#groupPassword2 .sidetip p.error.blank'
    },
    passwordconfirmOk: {
      selector: '#groupPassword2 .sidetip p.isaok'
    },
    createAccountBtn:{
      selector: 'input[type=submit]'
    }
  },
  commands: [{
    signupUser: function(user) {
      this
          .waitForElementVisible('@signupForm', 1000)
          .setValue('@firstnameInput', user.firstname)
          .setValue('@lastnameInput', user.lastname)
          .setValue('@emailInput', user.email)
          .setValue('@usenameInput', user.username)
          .setValue('@passwordInput', user.password)
          .setValue('@passwordconfirmInput', user.password)
          .click('@createAccountBtn')

      return this.api;
    }
  }]
};