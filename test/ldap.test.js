/**
  @fileoverview tests for lib/ldap.js 
**/

var validateLdapUser = require('../lib/ldap').validateLdapUser
  , config = require('../config').test.ldap
  , chai            = require('chai')
  , expect          = chai.expect;


describe('lib/ldap.validateLdapUser()', function() {
  var res;
  
  it("should authenticate a valid user", function(done){
    var req = {
      body:{
        username: config.username,
        password: config.password
      }
    };

    validateLdapUser(req, res, function next(err, user){
      expect(err).to.be.null
      expect(user).to.exist;
      expect(user.gecos).to.equal(config.gecos)
      expect(req.ldapUser).to.exist;
      expect(req.ldapUser).to.equal(user)
      done();
    });
  });

  // it("should correctly set a req.ldapUser object", function(done){
  //   var req = {
  //     body:{
  //       username: config.username,
  //       password: config.password
  //     }
  //   };

  //   validateLdapUser(req, res, function next(err, user){
  //     expect(req.ldapUser).to.exist;
  //     expect(req.ldapUser).to.equal(user)
  //     done();
  //   });
  // });


  // it("should return an error for a non existing user", function(done){
  //   var req = {
  //     body:{
  //       username: "invalid",
  //       password: "invalid"
  //     }
  //   };

  //   validateLdapUser(req, res, function next(err, user){
  //     expect(err).to.exist;
  //     expect(err).to.equal('no such user: "invalid"');
  //     expect(user).to.be.undefined;
  //     done();
  //   });
  // });

  // it("should return an error for a invalid password of existing user", function(done){
  //   var req = {
  //     body:{
  //       username: config.username,
  //       password: "invalid"
  //     }
  //   };

  //   validateLdapUser(req, res, function next(err, user){
  //     expect(err).to.exist;
  //     expect(err.name).to.equal('InvalidCredentialsError');
  //     expect(err.message).to.equal('Invalid Credentials');
  //     expect(user).to.be.undefined;
  //     done();
  //   });
  // });

  // it("should return an error if username is undefined", function(done){
  //   var req = {
  //     body:{
  //       password: "invalid"
  //     }
  //   };

  //   validateLdapUser(req, res, function next(err, user){
  //     expect(err).to.exist;
  //     expect(err).to.equal('empty username');
  //     expect(user).to.be.undefined;
  //     done();
  //   });
  // });

  // it("should return an error if password is undefined", function(done){
  //   var req = {
  //     body:{
  //       username: config.username
  //     }
  //   };

  //   validateLdapUser(req, res, function next(err, user){
  //     expect(err).to.exist;
  //     expect(err.message).to.equal('password is undefined');
  //     expect(user).to.be.undefined;
  //     done();
  //   });
  // });
});
