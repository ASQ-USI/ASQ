module.exports = {
  "signup test" : function (browser) {
    browser
      .url(browser.launchUrl + '/signup')
      .waitForElementVisible('body', 500)
      .getTitle(function(title) {
         this.assert.ok((new RegExp(/sign up/i)).test(title), 'should be signup page');
       })
      .assert.elementPresent('form[action="/signup"]', 'signup form should exist')
      .assert.elementPresent('input:focus', 'first input has focus')
      .pause(500)
      
      .click('input[name="signuplastname"]')
      .pause(200)
      .assert.visible('#groupLastname .sidetip p.tip', 'Show tips for a focused field.')
      
      .setValue('input[name=signuplastname]', 'White')
      .pause(200)
      .assert.visible('#groupLastname .sidetip p.isaok', 'Show ok for valid lastname.')
      .pause(200)
      
      .setValue('input[name=signupemail]', 'walter@white')
      .pause(200)
      .assert.visible('#groupEmail .sidetip p.error.invalid', 'Show invalid message for invalid email.')
      .assert.value('input[name=signupemail]', 'walter@white', 'Don\'t modify bad inputs.')
      .assert.value('input[name=signupusername]', '', 'Don\'t set the username from a bad email.')
      
      .clearValue('input[name=signupemail]') 
      .setValue('input[name=signupemail]', 'walter@white.com' )
      .pause(200)
      .assert.visible('#groupEmail .sidetip p.isaok', 'Show ok for valid email.')
      .assert.value('input[name=signupusername]', 'walter', 'Set username from valid email.')
      .assert.visible('#groupUsername .sidetip p.isaok', 'Show ok for valid username from email.')

      .setValue('input[name=signuppassword]',  'breakingbad')
      .pause(200)
      .assert.visible('#groupPassword1 .sidetip p.error.invalid', 'Show invalid message for invalid password.')
      .assert.visible('#groupPassword2 .sidetip p.error.blank', 'Show blank message for so far blank password confirmation.')
      
      .setValue('input[name=signuppasswordconfirm]',  'breakingbad')
      .pause(200)
      .assert.visible('#groupPassword1 .sidetip p.error.invalid', 'Don\'t change invalid password message on password confirmation.')
      .assert.visible('#groupPassword2 .sidetip p.isaok', 'Show ok message for password confirmation if value matches password.')
      .getValue("input[name=signuppassword]", function(password) {
        this.getValue("input[name=signuppasswordconfirm]", function(passwordconfirm) {
          this.assert.equal(password.value, passwordconfirm.value, 'Check passwords actually match.');
        });
      })

      .clearValue('input[name=signuppassword]') 
      .setValue('input[name=signuppassword]', 'BreakingBad123!')
      .pause(200)
      .assert.visible('#groupPassword1 .sidetip p.isaok', 'Show ok for valid password.')
      .assert.visible('#groupPassword2 .sidetip p.error.mismatch', 'Show mismatch message on password inpupt change.')
      .getValue("input[name=signuppassword]", function(password) {
        this.getValue("input[name=signuppasswordconfirm]", function(passwordconfirm) {
          this.assert.notEqual(password.value, passwordconfirm.value, 'Check passwords actually don\'t match.');
        });
      })

      .clearValue('input[name=signuppasswordconfirm]') 
      .setValue('input[name=signuppasswordconfirm]', 'BreakingBad123!')
      .pause(200)
      .assert.visible('#groupPassword1 .sidetip p.isaok', 'Show ok for valid password.')
      .assert.visible('#groupPassword2 .sidetip p.isaok', 'Show ok for matching passwords.')
      .getValue("input[name=signuppassword]", function(password) {
        this.getValue("input[name=signuppasswordconfirm]", function(passwordconfirm) {
          this.assert.equal(password.value, passwordconfirm.value, 'Check passwords actually match.');
        });
      })  
      .end();
  },
};
