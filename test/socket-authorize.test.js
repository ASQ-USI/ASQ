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


describe('Socket ctrl authorization', function testCtrlAuth() {
  // Create the session Id
  var sessionId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
  // Create the whitelist data
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
      var testSession = new Session({
        _id : sessionId
      });

      // Create a whitelist entry
      var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
      var testWhitelistEntry = new WhitelistEntry({
        session     : sessionId,
        uid         : mongoose.Types.ObjectId('4edd40c86762e0fb12000003'),
        token       : token,
        displayName : displayName
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

  describe('Empty handshake', function(){
    authentication.ctrlAuthorize({}, function(err, authorized) {
      it('Should return an error saying missing session', function() {
        expect(err).to.equal('Missing session');
      });

      it('Should not authorize the connection', function() {
        expect(authorized).to.equal(false);
      });
    });
  });

  describe('Empty query', function() {
    authentication.ctrlAuthorize({ "query" : {} }, function(err, authorized) {
      it('Should return an error saying missing session', function() {
        expect(err).to.equal('Missing session');
      });

      it('Should not authorize the connection', function() {
        expect(authorized).to.equal(false);
      });
    });
  });

  describe('Valid connection', function() {
    var err, authorized;

    // if we want multiple tests on a callback it's more clean to do it like this
  // (with a before close)cat
    // I know I had like you did, but apparently we have silent fails of callbacks
    // so I need to change it too

    // This never enters the callback
    before(function(done){
      authentication.ctrlAuthorize(handshakeData, function(err, authorized) {
        // we cannot reach here
        console.log("I am in")
        err=err;
        console.log(err)
        authorized=authorized;
        done();
      });
    })

    it('Should not return an error', function() {
      expect(err).to.equal(null);
    });
    it('Should authorize the connection', function() {
      expect(authorized).to.equal(true);
    });
    it('Should set the session in the handshake', function() {
      expect(handshakeData.session).to.deep.equals(testSession);
    });
    it('Should set the displayName in the handshake', function() {
      expect(handshakeData.displayName).to.equal(dispayName);
    });
  });


  afterEach(function (done) {
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
});


