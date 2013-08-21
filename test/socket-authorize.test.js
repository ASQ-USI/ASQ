'user strict';

var chai         = require('chai')
, expect         = chai.expect
, socketUtils    = require('../lib/socket-utils')
, mongoose       = require('mongoose')
, config         = require('../config')
, proxyquire     = require('proxyquire')
, utilsStub       = {}
, authentication = proxyquire('../lib/authentication', { './utils' : utilsStub});

utilsStub.getSessionFromCookie = function(cookie) { return cookie; }

schemas = require('../models')
db = mongoose.createConnection(config.mongoDBServer, config.dbName,
        config.mongoDBPort);

// Create the session
var testSession = null;
var sessionId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');

// Create the whitelist
var testWhitelistEntry = null;
var token = 'test token';
var displayName = 'test name';

// Create the handhsake data
var handshakeData = {
  "query" : {
    "sid" : sessionId
  },
  "headers" : {
    "cookie" : token
  }
};

before(function(done) {

  function populateDB() {
    // Create a Session
    var Session = db.model('Session', schemas.sessionSchema);
    testSession = new Session({
      _id : sessionId
    });

    // Create a whitelist entry
    var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
    testWhitelistEntry = new WhitelistEntry({
      session     : sessionId,
      uid         : mongoose.Types.ObjectId('4edd40c86762e0fb12000003'),
      token       : token,
      displayName : displayName,
      canControl  : true
    });
    testSession.save(function(err, session) {
      if (err) {
        done(err);
      }
      testWhitelistEntry.save(done);
    });
  }
  populateDB();
});

describe('Test ctrlAuthorize', function testCtrlAuth() {

  describe('with an empty handshake', function(){
    var error, isAuthorized;

    before(function(done){
      authentication.ctrlAuthorize({}, function(err, authorized) {
        error = err;
        isAuthorized = authorized;
        done();
      });
    });

    describe('Refuse the connection with an error message', function() {
      it('Should return an error saying "Missing session".', function() {
        expect(error).to.deep.equal(new Error('Missing session'));
      });

      it('Should not authorize the connection.', function() {
        expect(isAuthorized).to.be.false;
      });
    });
  });

  describe('with an empty query', function() {
    var error, isAuthorized;

    before(function(done){
      authentication.ctrlAuthorize({ "query" : {} }, function(err, authorized) {
        error = err;
        isAuthorized = authorized;
        done();
      });
    });

    describe('Refuse the connection with an error message', function() {
      it('Should return an error saying "Missing session".', function() {
        expect(error).to.deep.equal(new Error('Missing session'));
      });

      it('Should not authorize the connection.', function() {
        expect(isAuthorized).to.be.false;
      });
    });
  });

  describe('Valid connection', function() {
    var error, isAuthorized;
    var sessionKeysToTest = ['_id', 'startDate', 'activeSlide', 'authLevel'];

    before(function(done){
      authentication.ctrlAuthorize(handshakeData, function(err, authorized) {
        error = err;
        isAuthorized = authorized;
        done();
      });
    });

    describe('Accept the connection and update the handshake', function() {
      it('Should not return an error', function() {
        expect(error).to.be.null;
      });
      it('Should authorize the connection', function() {
        expect(isAuthorized).to.equal(true);
      });
      it('Should set the session in the handshake', function() {
        for (var i in sessionKeysToTest) {
          var key = sessionKeysToTest[i];
          expect(handshakeData.session[key]).to.deep.equal(testSession[key]);
          // For some reason to.have(.deep).property(key, value) does not work.
        }
      });
      it('Should set the displayName in the handshake', function() {
        expect(handshakeData.displayName).to.equal(displayName);
      });
    });
  });

});

after(function (done) {
  var Session = db.model('Session', schemas.sessionSchema);
  var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);

  Session.remove({ _id : sessionId}, function(err) {
    if (err) {
      return done(err);
    }
    WhitelistEntry.remove({ session : sessionId }, function(err) {
      if (err) {
        return done(err);
      }
      mongoose.disconnect();
    });
  })
  
  return done();
});


