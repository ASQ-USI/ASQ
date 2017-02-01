module.exports = {
  "signup form validation" : function (browser) {
    const signupPage = browser.page.signup();

    signupPage.navigate();

    browser
      .waitForElementVisible('body', 500)
      .getTitle(function(title) {
         this.assert.ok((new RegExp(/sign up/i)).test(title), 'should be signup page');
       });

    signupPage
      .assert.visible('@signupForm', 'signup form should exist')
      .assert.elementPresent('input:focus', 'first input has focus')
      .assert.visible('@firstnameTip', 'Show tips for firstname.')
      .setValue('@firstnameInput', 'Walter');
    browser.pause(200);
    signupPage.assert.visible('@firstnameOk', 'Show ok for valid firstname.');

    signupPage.click('@lastnameInput');
    browser.pause(200);
    signupPage.assert.visible('@lastnameTip', 'Show tip for lastname.')

    signupPage.setValue('@lastnameInput', 'White');
    browser.pause(200)
    signupPage.assert.visible('@lastnameOk', 'Show ok for valid lastname.');

    signupPage.setValue('@emailInput', 'walter@white');
    browser.pause(200);
    signupPage
      .assert.visible('@emailErrorInvalid', 'Show invalid message for invalid email.')
      .assert.value('@emailInput', 'walter@white', 'Don\'t modify bad inputs.')
      .assert.value('@usenameInput', '', 'Don\'t set the username from a bad email.');
      
    signupPage.click('@createAccountBtn')
    browser
      .pause(200)
      .getTitle(function(title) {
         this.assert.ok((new RegExp(/sign up/i)).test(title), 'should not allow submission with validation errors');
       });

    signupPage
      .clearValue('@emailInput') 
      .setValue('@emailInput', 'walter@white.com' );
    browser.pause(200);
    signupPage
      .assert.visible('@emailOk', 'Show ok for valid email.')
      .assert.value('@usenameInput', 'walter', 'Set username from valid email.')
      .assert.visible('@usernameOk', 'Show ok for valid username from email.');

    signupPage.setValue('@passwordInput',  'breakingbad');
    browser.pause(200);
    signupPage
      .assert.visible('@passwordErrorInvalid', 'Show invalid message for invalid password.')
      .assert.hidden('@passwordconfirmTip', 'Do not show tip message for so far blank password confirmation.')
      .assert.hidden('@passwordconfirmOk', 'Do not show ok message for so far blank password confirmation.')
      .assert.hidden('@passwordconfirmBlankMessage', 'Do not show blank error message for so far blank password confirmation.')
      .assert.hidden('@passwordconfirmErrorMismatch', 'Do not show mismatch error message for so far blank password confirmation.');
      
    signupPage.click('@createAccountBtn')
    browser
      .pause(200)
      .getTitle(function(title) {
         this.assert.ok((new RegExp(/sign up/i)).test(title), 'should not allow submission with no password confirmation');
       });

    signupPage.setValue('@passwordconfirmInput',  'breakingbad');
    browser.pause(200);
    signupPage.assert.visible('@passwordErrorInvalid', 'Don\'t change invalid password message on password confirmation.')
      .assert.visible('@passwordconfirmOk', 'Show ok message for password confirmation if value matches password.')
      .getValue("@passwordInput", function(password) {
        signupPage.getValue("@passwordconfirmInput", function(passwordconfirm) {
          this.assert.equal(password.value, passwordconfirm.value, 'Check passwords actually match.');
        });
      });

    signupPage
      .clearValue('@passwordInput') 
      .setValue('@passwordInput', 'BreakingBad123!');
    browser.pause(200);
    signupPage
      .assert.visible('#groupPassword1 .sidetip p.isaok', 'Show ok for valid password.')
      .assert.visible('#groupPassword2 .sidetip p.error.mismatch', 'Show mismatch message on password inpupt change.')
      .getValue("@passwordInput", function(password) {
        signupPage.getValue("@passwordconfirmInput", function(passwordconfirm) {
          this.assert.notEqual(password.value, passwordconfirm.value, 'Check passwords actually don\'t match.');
        });
      });

    signupPage.click('@createAccountBtn')
    browser
      .pause(200)
      .getTitle(function(title) {
         this.assert.ok((new RegExp(/sign up/i)).test(title), 'should not allow submission with password mismatch');
       });

    signupPage
      .clearValue('@passwordInput') 
      .setValue('@passwordInput', 'BreakingBad123!')
      .clearValue('@passwordconfirmInput') 
      .setValue('@passwordconfirmInput', 'BreakingBad123!');
    browser.pause(200);
    signupPage
      .assert.visible('@passwordOk', 'Show ok for valid password.')
      .assert.visible('@passwordconfirmOk', 'Show ok for matching passwords.')
      .getValue("@passwordInput", function(password) {
        signupPage.getValue("@passwordconfirmInput", function(passwordconfirm) {
          this.assert.equal(password.value, passwordconfirm.value, 'Check passwords actually match.');
        });
      });
    browser.end();
  },
  "signup a user" : function (browser) {
    const signupPage = browser.page.signup();
    signupPage.navigate();

    signupPage.signupUser(browser.globals.users.normalUser);

    browser
      .waitForElementVisible('body[data-view-name="presentations"]', 1000, 'Should take him to the presentations page')
      .end();
  }
};
