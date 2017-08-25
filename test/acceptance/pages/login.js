module.exports = {
  url: function() {
    return `${this.api.launchUrl}/login`;
  },
  elements: {
    usernameField: {
      selector: 'input[name=username]'
    },
    passwordField: {
      selector: 'input[name=password]'
    },
    submit: {
      selector: 'input[type=submit]'
    }
  },
  commands: [{
    loginUserWithEnterKey: function(username, password) {
      this
          .waitForElementVisible('body', 1000)
          .setValue('@usernameField', username)
          .setValue('@passwordField', [password, this.api.Keys.ENTER]);
          this.api.pause(200);
          this.waitForElementPresent('body', 10000);

      return this.api;
    },
    loginUser: function(username, password) {
      this
          .waitForElementVisible('body', 1000)
          .setValue('@usernameField', username)
          .setValue('@passwordField', password)
          .click('@submit');
          this.api.pause(200);
          this.waitForElementPresent('body', 10000);

      return this.api;
    }
  }]
};