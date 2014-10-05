
// describe('Signup page', function() {
//   it('should show a signup form');
//   it('should refuse empty submissions');
//   it('should refuse partial submissions');
//   it('should show tips for a focused field')
//   it('should give a warning for a dirty empty field')
//   it('should refuse invalid emails');
//   it('should refuse invalid usenames');
//   it('should refuse invalid passwords');
//   it('should refuse passwords that do not match');
//   it('should accept complete submissions');
// });

var screenshotPath = './test/acceptance/screenshots/';

//remote console messages
casper.on('remote.message', function(message) {
    console.log(message);
});

//page errors
casper.on('page.error', function(msg, trace) {
    this.echo('Error: ' + msg, 'ERROR');
});

casper.test.begin('Signup page', 21, function suite(test) {
    casper.start('http://localhost:3000/signup/', function() {
      test.assertTitleMatches(/sign up/i, 'should be signup page');
      test.assertExists('form[action="/signup"]', 'signup form should exist');

        // test.assertExists('input:focus', 'first input has focus');
        // this.clickLabel('Testing');

    });

    casper.wait(400, function() {
      this.click('input[name="signuplastname"]')
    })

    casper.then(function() {
        test.assertVisible('#groupLastname .sidetip p.tip', 'Show tips for a focused field.');
    });

    //use this to fill the form
    casper.then(function(){
      this.fill('form#signup-form', { 'signuplastname':  'White' });
    });

    casper.wait(300, function() {
      test.assertVisible('#groupLastname .sidetip p.isaok', 'Show ok for valid lastname.');
    });

    casper.then(function() {
      this.fill('form#signup-form', { 'signupemail' : 'walter@white' });
    });

    casper.wait(300, function() {
      test.assertVisible('#groupEmail .sidetip p.error.invalid', 'Show invalid message for invalid email.');
      test.assertField('signupemail', 'walter@white', 'Don\'t modify bad inputs.');
      test.assertField('signupusername', '', 'Don\'t set the username from a bad email.');

      this.fill('form#signup-form', { 'signupemail' : 'walter@white.com' });
    });

    casper.wait(300, function() {
      test.assertVisible('#groupEmail .sidetip p.isaok', 'Show ok for valid email.');
      test.assertField('signupusername', 'walter', 'Set username from valid email.');
      test.assertVisible('#groupUsername .sidetip p.isaok', 'Show ok for valid username from email.');

      this.fill('form#signup-form', { 'signuppassword' : 'breakingbad' });
    });

    casper.wait(300, function() {
      test.assertVisible('#groupPassword1 .sidetip p.error.invalid', 'Show invalid message for invalid password.');
      test.assertVisible('#groupPassword2 .sidetip p.error.blank', 'Show blank message for so far blank password confirmation.');
      this.fill('form#signup-form', { 'signuppasswordconfirm' : 'breakingbad' });
    });

    casper.wait(300, function() {
      test.assertVisible('#groupPassword1 .sidetip p.error.invalid', 'Don\'t change invalid password message on password confirmation.');
      test.assertVisible('#groupPassword2 .sidetip p.isaok', 'Show ok message for password confirmation if value matches password.');
      var password = this.getFormValues('form#signup-form').signuppassword;
      var passwordConfirm = this.getFormValues('form#signup-form').signuppasswordconfirm;
      test.assertEquals(password, passwordConfirm, 'Check passwords actually match.');

      this.fill('form#signup-form', { 'signuppassword' : 'BreakingBad123!' });
    });

    casper.wait(300, function() {
      test.assertVisible('#groupPassword1 .sidetip p.isaok', 'Show ok for valid password.');
      test.assertVisible('#groupPassword2 .sidetip p.error.mismatch', 'Show mismatch message on password inpupt change.');
      var password = this.getFormValues('form#signup-form').signuppassword;
      var passwordConfirm = this.getFormValues('form#signup-form').signuppasswordconfirm;
      test.assertNotEquals(password, passwordConfirm, 'Check passwords actually don\'t match.');

      this.fill('form#signup-form', { 'signuppasswordconfirm' : 'BreakingBad123!' });
    });

    casper.wait(300, function() {
      test.assertVisible('#groupPassword1 .sidetip p.isaok', 'Show ok for valid password.');
      test.assertVisible('#groupPassword2 .sidetip p.isaok', 'Show ok for matching passwords.');
      var password = this.getFormValues('form#signup-form').signuppassword;
      var passwordConfirm = this.getFormValues('form#signup-form').signuppasswordconfirm;
      test.assertEquals(password, passwordConfirm, 'Check passwords actually match.');
    });

    casper.then(function() {
      //if you need a screenshot
        casper.capture(screenshotPath + 'signup.png');
    });


    casper.run(function() {
        test.done();
    });
});