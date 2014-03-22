
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

var screenshotPath = "./test/acceptance/screenshots/";

//remote console messages
casper.on('remote.message', function(message) {
    console.log(message);
});

//page errors
casper.on("page.error", function(msg, trace) {
    this.echo("Error: " + msg, "ERROR");
});

casper.test.begin('Signup page', 3, function suite(test) {
    casper.start('http://localhost:3000/signup/', function() {
      test.assertTitleMatches(/sign up/i, 'should be signup page');
      test.assertExists('form[action="/signup"]', "signup form should exist");

        // test.assertExists('input:focus', "first input has focus");
        // this.clickLabel('Testing');

    });

    casper.wait(400, function() {
        this.click('input[name="signuplastname"]')
      })

    casper.then(function() {
        test.assertVisible('#groupLastname .sidetip p.tip', "show tips for a focused field");
    });

    //use this to fill the form
    casper.then(function(){
       this.fill('form#signup-form', {
          'signupfirstname':  'Toddler'
      });
    })

    casper.then(function() {
      //if you need a screenshot
        casper.capture(screenshotPath + 'signup.png')
    });


    casper.run(function() {
        test.done();
    });
});