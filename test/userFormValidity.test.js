var chai = require('chai')
  , expect = chai.expect
  , utils  = require('../lib/utils').form
  , errors  = {};//require('../lib/error-messages');

console.info(
  'THIS TEST MUST BE UPDATED TO WORK WITH THE NEW VALIDATION METHODS!');

describe('User data validation', function(){
  describe('StrictValidation Mode', function() {
    var strictValidation = true;
    describe('Valid inputs', function() {
      it.skip('Must return null.', function() {
        var username = 'iron-man_1.2';
        var email = 'super.valid@mail.com';
        var password = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var passwordConfirm = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var result = utils.isValidUserForm(username, email, password,
            passwordConfirm, strictValidation);
        expect(result).to.be.null;
      });
    });

    describe('Single invalid input', function() {
      it.skip('Must detect an invalid username', function() {
        var username = 'ThisUserNameIsWayTooLongToBeValid';
        var email = 'super.valid@mail.com';
        var password = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var passwordConfirm = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var result = utils.isValidUserForm(username, email, password,
          passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({ username : errors.username.regex });
      });
      it.skip('Must detect an invalid email', function() {
        var username = 'iron-man_1.2';
        var email = 'ThisIsNotAn.em@il';
        var password = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var passwordConfirm = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var result = utils.isValidUserForm(username, email, password,
          passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({ email : errors.email.isEmail });
      });
      it.skip('Must detect an invalid password', function() {
        var username = 'iron-man_1.2';
        var email = 'super.valid@mail.com';
        var password = 'badPassword';
        var passwordConfirm = 'badPassword';
        var result = utils.isValidUserForm(username, email, password,
          passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({ password : errors.password.regex });
      });
      it.skip('Must detect non matching passwords', function() {
        var username = 'iron-man_1.2';
        var email = 'super.valid@mail.com';
        var password = 'Sup3r-Secre7_P@ssw**rd_Ver1';
        var passwordConfirm = 'Sup3r-Secre7_P@ssw**rd_Ver2';
        var result = utils.isValidUserForm(username, email, password,
          passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({
          passwordConfirm : errors.passwordConfirm.equals
        });
      });
    });

    describe('Multiple invalid inputs', function() {
      var username = 'invalid!#$';
      var email = 'not today';
      var password = 'verybadpassword';
      var passwordConfirm = 'thisaintbetter';
      // var result = utils.isValidUserForm(username, email, password,
      //   passwordConfirm, strictValidation);
      it.skip('Must be a single object with all errors', function() {
        expect(result).not.to.be.an('array');
        expect(result).to.be.an('object');
      })
      it.skip('Must detect an invalid username', function() {
        expect(result).to.have.property('username', errors.username.regex);
      });
      it.skip('Must detect an invalid email', function() {
        expect(result).to.have.property('email', errors.email.isEmail);
      });
      it.skip('Must detect an invalid password', function() {
        expect(result).to.have.property('password', errors.password.regex);
      });
      it.skip('Must detect non matching passwords', function() {
        expect(result).to.have.property('passwordConfirm',
            errors.passwordConfirm.equals);
      });
    });

    describe('Single missing input', function() {
      var username = 'iron-man_1.2';
      var email = 'super.valid@mail.com';
      var password = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
      var passwordConfirm = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
      it.skip('Must detect a missing username.', function() {
        var result = utils.isValidUserForm('', email, password,
            passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({ username : errors.username.notEmpty });
      });
      it.skip('Must detect a missing email.', function() {
        var result = utils.isValidUserForm(username, '', password,
            passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({ email : errors.email.notEmpty });
      });
      it.skip('Must detect a missing password.', function() {
        var result = utils.isValidUserForm(username, email, '',
            passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({
          password        : errors.password.notEmpty,
          passwordConfirm : errors.passwordConfirm.equals
        });
      });
      it.skip('Must detect a missing password confirmation.', function() {
        var result = utils.isValidUserForm(username, email, password, '',
            strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({ passwordConfirm :
          errors.passwordConfirm.equals
        });
      });
    });

    describe('Multiple missing inputs', function() {
      //var result = utils.isValidUserForm('', '', '', '', strictValidation);
      it.skip('Must be a single object with all errors', function() {
        expect(result).not.to.be.an('array');
        expect(result).to.be.an('object');
      })
      it.skip('Must detect a missing username', function() {
        expect(result).to.have.property('username', errors.username.notEmpty);
      });
      it.skip('Must detect a missing email', function() {
        expect(result).to.have.property('email', errors.email.notEmpty);
      });
      it.skip('Must detect a missing password', function() {
        expect(result).to.have.property('password', errors.password.notEmpty);
      });
      it.skip('Must not detect empty matching passwords', function() {
        expect(result).to.not.have.property('passwordConfirm');
      });
    });
  });

  describe('Non StrictValidation Mode', function() {
    var strictValidation = false;
    describe('Valid inputs', function() {
      it.skip('Must return null.', function() {
        var username = 'iron-man_1.2';
        var email = 'super.valid@mail.com';
        var password = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var passwordConfirm = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var result = utils.isValidUserForm(username, email, password,
            passwordConfirm, strictValidation);
        expect(result).to.be.null;
      });
    });

    describe('Single invalid input', function() {
      it.skip('Must detect an invalid username.', function() {
        var username = 'ThisUserNameIsWayTooLongToBeValid';
        var email = 'super.valid@mail.com';
        var password = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var passwordConfirm = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var result = utils.isValidUserForm(username, email, password,
          passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({ username : errors.username.regex });
      });
      it.skip('Must detect an invalid mail.', function() {
        var username = 'iron-man_1.2';
        var email = 'ThisIsNotAn.em@il';
        var password = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var passwordConfirm = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
        var result = utils.isValidUserForm(username, email, password,
          passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({ email : errors.email.isEmail });
      });
      it.skip('Must detect an invalid password.', function() {
        var username = 'iron-man_1.2';
        var email = 'super.valid@mail.com';
        var password = 'badPassword';
        var passwordConfirm = 'badPassword';
        var result = utils.isValidUserForm(username, email, password,
          passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({ password : errors.password.regex });
      });
      it.skip('Must detect the non matching passwords.', function() {
        var username = 'iron-man_1.2';
        var email = 'super.valid@mail.com';
        var password = 'Sup3r-Secre7_P@ssw**rd_Ver1';
        var passwordConfirm = 'Sup3r-Secre7_P@ssw**rd_Ver2';
        var result = utils.isValidUserForm(username, email, password,
          passwordConfirm, strictValidation);
        expect(result).to.be.an('object');
        expect(result).to.deep.equal({
          passwordConfirm : errors.passwordConfirm.equals
        });
      });
    });

     describe('Multiple invalid inputs', function() {
      var username = 'invalid!#$';
      var email = 'not today';
      var password = 'verybadpassword';
      var passwordConfirm = 'thisaintbetter';
      // var result = utils.isValidUserForm(username, email, password,
      //   passwordConfirm, strictValidation);
      it.skip('Must be a single object with all errors', function() {
        expect(result).not.to.be.an('array');
        expect(result).to.be.an('object');
      })
      it.skip('Must detect an invalid username', function() {
        expect(result).to.have.property('username', errors.username.regex);
      });
      it.skip('Must detect an invalid email', function() {
        expect(result).to.have.property('email', errors.email.isEmail);
      });
      it.skip('Must detect an invalid password', function() {
        expect(result).to.have.property('password', errors.password.regex);
      });
      it.skip('Must detect non matching passwords', function() {
        expect(result).to.have.property('passwordConfirm',
            errors.passwordConfirm.equals);
      });
    });

    describe('Single missing inputs', function() {
      var username = 'iron-man_1.2';
      var email = 'super.valid@mail.com';
      var password = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
      var passwordConfirm = 'Sup3r-Secre7_P@ssw**rd^(LOL?)!';
      it.skip('Must handle a missing username.', function() {
        var result = utils.isValidUserForm('', email, password,
            passwordConfirm, strictValidation);
        expect(result).to.be.null;
      });
      it.skip('Must handle a missing email.', function() {
        var result = utils.isValidUserForm(username, '', password,
            passwordConfirm, strictValidation);
        expect(result).to.be.null;
      });
      it.skip('Must handle missing password and password confirmation.', function() {
        var result = utils.isValidUserForm(username, email, '', '',
            strictValidation);
        expect(result).to.be.null;
      });
      it.skip('Must hanlde a missing password (with password confirmation present).',
        function() {
          var result = utils.isValidUserForm(username, email, '',
              passwordConfirm, strictValidation);
          expect(result).to.be.an('object');
          expect(result).to.deep.equal({
            passwordConfirm : errors.passwordConfirm.equals
          });
      });
      it.skip('Must handle a missing password confirmation (with password present).',
        function() {
          var result = utils.isValidUserForm(username, email, password, '',
              strictValidation);
          expect(result).to.be.an('object');
          expect(result).to.deep.equal({
            passwordConfirm : errors.passwordConfirm.equals
          });
      });
    });

    describe('Multiple missing inputs', function() {
      //var result = utils.isValidUserForm('', '', '', '', strictValidation);
      it.skip('Must return null.', function() {
        expect(result).to.be.null;
      });
    });
  });
});
