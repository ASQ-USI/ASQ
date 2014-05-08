/**
  @fileoverview tests for lib/authnetication.js for ASQ
**/

var chai      = require('chai')
  , sinon     = require("sinon")
  , sinonChai = require("sinon-chai")
  , expect    = chai.expect
  , mongoose  = require('mongoose')
  , config    = require('../config');

db = mongoose.createConnection(
  config.mongoDBServer,
  config.dbName,
  config.mongoDBPort
);

chai.use(sinonChai);

var mongooseFixtures = require('./util/mongoose-fixtures')
  , authFixtures     = require('./fixtures/auth.fixtures')
  , ids              = authFixtures.ids
  , fixtures         = authFixtures.fixtures
  , handshakes       = authFixtures.handshakes
  , reqs             = authFixtures.reqs
  , proxyquire       = require('proxyquire')
  , stub             = {
      presUtils : require('../lib/utils').presentation,
      auth: { getSessionFromCookie : function(cookie) { return cookie; }}
    }
  , authentication = proxyquire('../lib/authentication', { './utils' : stub})
  , User           = db.model('User')
  , GuestUser      = db.model('GuestUser')
  , WhitelistEntry = db.model('WhitelistEntry');

function populateDB(done) {
  mongooseFixtures.load(fixtures, db, function(err){
    if (err) {
      done(err);
    }
    var tasks = { done: 0, total: fixtures.GuestUser.length };
    fixtures.GuestUser.forEach(function insertGuestUser(guest) {
      var doc = new GuestUser(guest);
      doc.save(function onError(err) {
        if (err) {
          done(err);
          return;
        }
        tasks.done++;
        if (tasks.done === tasks.total) {
          done();
        }
      });
    });
  });
}

describe('authentication.authorizeSession(req, res, next)', function session() {
  describe('Public Session', function testPublic() {

    describe('without headers:', function withoutToken() {
      var req = reqs.missingHeaders;
      before(populateDB);
      it('Should refuse the connection wit the error: "Unable to retrieve cookie"',
        function testNoHeaders(done) {
          authentication.authorizeSession(req, null, function next(err) {
              expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
              done();
            });
        });
    });

    describe('without a token (cookie):', function withoutToken() {
      var req = reqs.missingToken;
      before(populateDB);
      it('Should refuse the connection wit the error: "Unable to retrieve cookie"',
        function testNoHeaders(done) {
          authentication.authorizeSession(req, null, function next(err) {
              expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
              done();
            });
        });
    });

    describe('with a not whitelisted registered user:', function regUserNotWhite() {
      var req = reqs.registeredNotWhite;
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection', function testRegNotWhite(done) {
        authentication.authorizeSession(req, null, function next(err) {
          expect(err).to.not.exist;
          done();
        });
      });
      it('Should create a whitelist entry for the user',
        function createdEntry(done){
          WhitelistEntry.count({
            token: req.headers.cookie,
            screenName: req.user.screenName,
            uid: req.user._id,
            session: req.liveSession._id,
            role : 'viewer'
          }, function onCount(err, count) {
              if (err) {
                done(err);
              } else {
                expect(count).to.equal(1);
                done();
              }
            });
      });
      it('Should set the whitelist entry in the request',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property('token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property(
            'screenName', req.user.screenName);
          expect(req.whitelistEntry).to.have.deep.property('uid')
          expect(req.whitelistEntry.uid.toString()).to.be.equal(
            req.user._id.toString());
          expect(req.whitelistEntry).to.have.deep.property('session')
          expect(req.whitelistEntry.session.toString()).to.be.equal(
            req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('with a whitelisted registered user:', function regUserWhite() {
      var req = reqs.registeredWhite;
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      this.timeout(0);
      it('Should accept the connection', function testRegNotWhite(done){
        authentication.authorizeSession(req, null, function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should update the whitelist entry with the token (cookie)',
        function updateWhitelist(done) {
          WhitelistEntry.count({
            uid        : req.user._id,
            screenName : req.user.screenName,
            token      : req.headers.cookie,
            session    : req.liveSession._id,
            role       : 'viewer'
          }, function onCount(err, count) {
            if (err) {
              done(err);
            } else {
              expect(count).to.equal(1);
              done();
            }
          });
        });
      it('Should set the whitelist entry in the request',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property(
            'token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property(
            'screenName', req.user.screenName);
          expect(req.whitelistEntry).to.have.deep.property('uid');
          expect(req.whitelistEntry.uid.toString()).to.be.equal(
            req.user._id.toString());
          expect(req.whitelistEntry).to.have.deep.property('session');
          expect(req.whitelistEntry.session.toString()).to.be.equal(
            req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('with a new guest user:', function newGuestUser() {
      this.timeout(0);
      var req = reqs.newGuest;
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection', function testNewGuest(done){
        authentication.authorizeSession(req, null, function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should create a new guest user',
        function createdUser(done){
          User.count({
            token: req.headers.cookie,
          }, function onCount(err, count) {
              if (err) {
                done(err);
              } else {
                expect(count).to.equal(1);
                done();
              }
            });
      });
      it('Should create a whitelist entry for the user',
        function createdEntry(done){
          WhitelistEntry.count({
            token: req.headers.cookie,
            session: req.liveSession._id,
            role: 'viewer'
          }, function onCount(err, count) {
              if (err) {
                done(err);
              } else {
                expect(count).to.equal(1);
                done();
              }
            });
      });
      it('Should set the whitelist entry in the request',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property(
            'token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property('screenName');
          expect(req.whitelistEntry).to.have.deep.property('session');
          expect(req.whitelistEntry.session.toString()).to.be.equal(
            req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('with an existing not whitelisted guest:', function guestNotWhite() {
      var req = reqs.guestNotWhite;
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection', function testGuestNotWhite(done){
        authentication.authorizeSession(req, null, function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should create a whitelist entry for the user',
        function createdEntry(done){
          WhitelistEntry.count({
            token: req.headers.cookie,
            screenName: fixtures.GuestUser[1].screenName,
            uid: ids.validGuest2,
            session: req.liveSession._id,
            role : 'viewer'
          }, function onCount(err, count) {
              if (err) {
                done(err);
              } else {
                expect(count).to.equal(1);
                done();
              }
            });
      });
      it('Should set the whitelist entry in the request',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property(
            'token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property(
            'screenName', fixtures.GuestUser[1].screenName);
          expect(req.whitelistEntry).to.have.deep.property('uid');
          expect(req.whitelistEntry.uid.toString()).to.be.equal(
            ids.validGuest2.toString());
          expect(req.whitelistEntry).to.have.deep.property('session');
          expect(req.whitelistEntry.session.toString()).to.be.equal(
            req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('with an existing whitelisted guest:', function guestWhite() {
      var req = reqs.guestWhite;
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection', function testGuestWhite(done){
        authentication.authorizeSession(req, null,
          function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should update the whitelist entry with the token (cookie)',
        function updateWhitelist(done) {
          WhitelistEntry.count({
            uid        : ids.validGuest1,
            screenName : fixtures.GuestUser[0].screenName,
            token      : req.headers.cookie,
            session    : req.liveSession._id,
            role       : 'viewer'
          }, function onCount(err, count) {
            if (err) {
              done(err);
            } else {
              expect(count).to.equal(1);
              done();
            }
          });
        });
      it('Should set the whitelist entry in the request',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property(
            'token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property(
            'screenName', fixtures.GuestUser[0].screenName);
          expect(req.whitelistEntry).to.have.property('uid');
          expect(req.whitelistEntry.uid.toString()).to.be.equal(
            ids.validGuest1.toString());
          expect(req.whitelistEntry).to.have.deep.property('session');
          expect(req.whitelistEntry.session.toString()).to.be.equal(
            req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });
  });
  describe('Anonymous Session', function testPublic() {

    describe('without headers:', function withoutToken() {
      var req = reqs.missingHeaders;
      //req.liveSession.authLevel = 'anonymous';
      before(populateDB);
      it('Should refuse the connection wit the error: "Unable to retrieve cookie"',
        function testNoHeaders(done) {
          authentication.authorizeSession(req, null, function next(err) {
              expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
              done();
            });
        });
    });

    describe('without a token (cookie):', function withoutToken() {
      var req = reqs.missingToken;
      //req.liveSession.authLevel = 'anonymous';
      before(populateDB);
      it('Should refuse the connection wit the error: "Unable to retrieve cookie"',
        function testNoHeaders(done) {
          authentication.authorizeSession(req, null, function next(err) {
              expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
              done();
            });
        });
    });

    describe('with a not whitelisted registered user:', function regUserNotWhite() {
      var req = reqs.registeredNotWhite;
      //req.liveSession.authLevel = 'anonymous';
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection', function testRegNotWhite(done) {
        authentication.authorizeSession(req, null, function next(err) {
          expect(err).to.not.exist;
          done();
        });
      });
      it('Should create a whitelist entry for the user',
        function createdEntry(done){
          WhitelistEntry.count({
            token: req.headers.cookie,
            screenName: req.user.screenName,
            uid: req.user._id,
            session: req.liveSession._id,
            role : 'viewer'
          }, function onCount(err, count) {
              if (err) {
                done(err);
              } else {
                expect(count).to.equal(1);
                done();
              }
            });
      });
      it('Should set the whitelist entry in the request',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property('token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property(
            'screenName', req.user.screenName);
          expect(req.whitelistEntry).to.have.deep.property('uid')
          expect(req.whitelistEntry.uid.toString()).to.be.equal(
            req.user._id.toString());
          expect(req.whitelistEntry).to.have.deep.property('session')
          expect(req.whitelistEntry.session.toString()).to.be.equal(
            req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('with a whitelisted registered user:', function regUserWhite() {
      var req = reqs.registeredWhite;
      //req.liveSession.authLevel = 'anonymous';
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection', function testRegNotWhite(done){
        authentication.authorizeSession(req, null, function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should update the whitelist entry with the token (cookie)',
        function updateWhitelist(done) {
          WhitelistEntry.count({
            uid        : req.user._id,
            screenName : req.user.screenName,
            token      : req.headers.cookie,
            session    : req.liveSession._id,
            role       : 'viewer'
          }, function onCount(err, count) {
            if (err) {
              done(err);
            } else {
              expect(count).to.equal(1);
              done();
            }
          });
        });
      it('Should set the whitelist entry in the request',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property(
            'token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property(
            'screenName', req.user.screenName);
          expect(req.whitelistEntry).to.have.deep.property('uid');
          expect(req.whitelistEntry.uid.toString()).to.be.equal(
            req.user._id.toString());
          expect(req.whitelistEntry).to.have.deep.property('session');
          expect(req.whitelistEntry.session.toString()).to.be.equal(
            req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('with a new guest user:', function newGuestUser() {
      this.timeout(0);
      var req = reqs.newGuest;
      //req.liveSession.authLevel = 'anonymous';
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection', function testNewGuest(done){
        authentication.authorizeSession(req, null, function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should create a new guest user',
        function createdUser(done){
          User.count({
            token: req.headers.cookie,
          }, function onCount(err, count) {
              if (err) {
                done(err);
              } else {
                expect(count).to.equal(1);
                done();
              }
            });
      });
      it('Should create a whitelist entry for the user',
        function createdEntry(done){
          WhitelistEntry.count({
            token: req.headers.cookie,
            session: req.liveSession._id,
            role: 'viewer'
          }, function onCount(err, count) {
              if (err) {
                done(err);
              } else {
                expect(count).to.equal(1);
                done();
              }
            });
      });
      it('Should set the whitelist entry in the request',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property(
            'token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property('screenName');
          expect(req.whitelistEntry).to.have.deep.property('session');
          expect(req.whitelistEntry.session.toString()).to.be.equal(
            req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('with an existing not whitelisted guest:', function guestNotWhite() {
      var req = reqs.guestNotWhite;
      //req.liveSession.authLevel = 'anonymous';
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection', function testGuestNotWhite(done){
        authentication.authorizeSession(req, null, function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should create a whitelist entry for the user',
        function createdEntry(done){
          WhitelistEntry.count({
            token: req.headers.cookie,
            screenName: fixtures.GuestUser[1].screenName,
            uid: ids.validGuest2,
            session: req.liveSession._id,
            role : 'viewer'
          }, function onCount(err, count) {
              if (err) {
                done(err);
              } else {
                expect(count).to.equal(1);
                done();
              }
            });
      });
      it('Should set the whitelist entry in the request',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property(
            'token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property(
            'screenName', fixtures.GuestUser[1].screenName);
          expect(req.whitelistEntry).to.have.deep.property('uid');
          expect(req.whitelistEntry.uid.toString()).to.be.equal(
            ids.validGuest2.toString());
          expect(req.whitelistEntry).to.have.deep.property('session');
          expect(req.whitelistEntry.session.toString()).to.be.equal(
            req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('with an existing whitelisted guest:', function guestWhite() {
      var req = reqs.guestWhite;
      //req.liveSession.authLevel = 'anonymous';
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection', function testGuestWhite(done){
        authentication.authorizeSession(req, null,
          function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should update the whitelist entry with the token (cookie)',
        function updateWhitelist(done) {
          WhitelistEntry.count({
            uid        : ids.validGuest1,
            screenName : fixtures.GuestUser[0].screenName,
            token      : req.headers.cookie,
            session    : req.liveSession._id,
            role       : 'viewer'
          }, function onCount(err, count) {
            if (err) {
              done(err);
            } else {
              expect(count).to.equal(1);
              done();
            }
          });
        });
      it('Should set the whitelist entry in the request',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property(
            'token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property(
            'screenName', fixtures.GuestUser[0].screenName);
          expect(req.whitelistEntry).to.have.property('uid');
          expect(req.whitelistEntry.uid.toString()).to.be.equal(
            ids.validGuest1.toString());
          expect(req.whitelistEntry).to.have.deep.property('session');
          expect(req.whitelistEntry.session.toString()).to.be.equal(
            req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });
  });
});

describe('authentication.ctrlAuthorize(handshakeData)', function testCtrlAuth() {
  describe('with an empty handshake:', function testEmptyHandshake() {
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.ctrlAuthorize(handshakes.empty, function(err, authorized) {
        error = err;
        expect(authorized).to.be.false;
        done();
      });
    });
    it('Should return an error saying: "Missing Session"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Missing session'));
        done();
    });
  });

  describe('without a query:', function testNoQuery() {
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.ctrlAuthorize(handshakes.missingQuery,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Missing Session"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Missing session'));
        done();
    });
  });

  describe('without a session id:', function testNoSessionId(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.ctrlAuthorize(handshakes.missingSessionId,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Missing Session"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Missing session'));
        done();
    });
  });

  describe('without headers:', function testNoHeaders(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.ctrlAuthorize(handshakes.missingHeaders,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authenticated or missing cookie"',
      function testError(done) {
        expect(error).to.deep.equal(
          new Error('Not authenticated or missing cookie'));
        done();
    });
  });

  describe('without a token (cookie):', function testNoToken(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.ctrlAuthorize(handshakes.missingToken,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authenticated or missing cookie"',
      function testError(done) {
        expect(error).to.deep.equal(
          new Error('Not authenticated or missing cookie'));
        done();
    });
  });

  describe('with an invalid session id:', function testBadSessionId(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.ctrlAuthorize(handshakes.invalidSession,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authorized"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Not authorized'));
        done();
    });
  });

  describe('with an invalid token (cookie):', function testBadToken(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.ctrlAuthorize(handshakes.invalidToken,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authorized"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Not authorized'));
        done();
    });
  });

  describe('with invalid session id and token:', function testBadSessionIdAndToken(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.ctrlAuthorize(handshakes.invalidSessionAndToken,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authorized"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Not authorized'));
        done();
    });
  });

  describe('with a user who has a "viewer" role:', function testUserIsViewer(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.ctrlAuthorize(handshakes.validViewer,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authorized"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Not authorized'));
        done();
    });
  });

  describe('with a user who has a "presenter" role:', function testPresenter(){
    before(populateDB);
    it('Should accept the connection', function testAcceptConnection(done) {
      authentication.ctrlAuthorize(handshakes.validPresenter,
        function(err, authorized) {
          expect(err).to.not.exist;
          expect(authorized).to.be.true;
          done();
      });
     });
    it('Should set the session in the handshake', function testSetSession(){
      var keysToTest = ['_id', 'startDate', 'activeSlide', 'authLevel'];
      for (var key in keysToTest) {
        expect(handshakes.validPresenter.session[key]).to.deep.equal(
          fixtures.Session[0][key]);
        // For some reason to.have(.deep).property(key, value) does not work.
        }
    });
    it('Should set the "screenName in the handshake', function testSetScreenName() {
      expect(handshakes.validPresenter.screenName).to.equal(
        fixtures.WhitelistEntry[0].screenName);
    });
  });
});

describe('authentication.liveAuthorize(handshakeData)', function testCtrlAuth() {
  describe('with an empty handshake:', function testEmptyHandshake(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.liveAuthorize(handshakes.empty, function(err, granted) {
        error = err;
        expect(granted).to.be.false;
        done();
      });
    });
    it('Should return an error saying: "Missing Session"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Missing session'));
        done();
    });
  });

  describe('without a query:', function testNoQuery() {
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.liveAuthorize(handshakes.missingQuery,
          function(err, authorized) {
        error = err;
        expect(authorized).to.be.false;
        done();
      });
    });
    it('Should return an error saying: "Missing Session"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Missing session'));
        done();
    });
  });

  describe('without a session id:', function testNoSessionId(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.liveAuthorize(handshakes.missingSessionId,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Missing Session"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Missing session'));
        done();
    });
  });

  describe('without headers:', function testNoHeaders(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.liveAuthorize(handshakes.missingHeaders,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authenticated or missing cookie"',
      function testError(done) {
        expect(error).to.deep.equal(
          new Error('Not authenticated or missing cookie'));
        done();
    });
  });

  describe('without a token (cookie):', function testNoToken(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.liveAuthorize(handshakes.missingToken,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authenticated or missing cookie"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Not authenticated or missing cookie'));
        done();
    });
  });

  describe('with an invalid session id:', function testBadSessionId(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.liveAuthorize(handshakes.invalidSession,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authorized"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Not authorized'));
        done();
    });
  });

  describe('with an invalid token (cookie):', function testBadToken(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.liveAuthorize(handshakes.invalidToken,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authorized"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Not authorized'));
        done();
    });
  });

  describe('with invalid session id and token:', function testBadSessionIdAndToken(){
    var error = null;
    before(populateDB);
    it('Should refuse the connection',
      function testRefuseConnection(done) {
        authentication.liveAuthorize(handshakes.invalidSessionAndToken,
          function(err, authorized) {
            error = err;
            expect(authorized).to.be.false;
            done();
        });
    });
    it('Should return an error saying: "Not authorized"',
      function testError(done) {
        expect(error).to.deep.equal(new Error('Not authorized'));
        done();
    });
  });

  describe('with a user who has a "viewer" role:', function testViewer(){
    before(populateDB);
    it('Should accept the connection',
      function testRefuseConnection(done) {
        authentication.liveAuthorize(handshakes.validViewer,
          function(err, authorized) {
            expect(err).to.not.exist;
            expect(authorized).to.be.true;
            done();
        });
    });
    it('Should set the session in the handshake', function testSetSession(){
      var keysToTest = ['_id', 'startDate', 'activeSlide', 'authLevel'];
      for (var key in keysToTest) {
        expect(handshakes.validViewer.session[key]).to.deep.equal(
          fixtures.Session[0][key]);
        // For some reason to.have(.deep).property(key, value) does not work.
        }
    });
    it('Should set the "screenName in the handshake', function testSetScreenName() {
      expect(handshakes.validViewer.screenName).to.equal(
        fixtures.WhitelistEntry[1].screenName);
    });
  });

  describe('with a user who has a "presenter" role:', function testPresenter(){
    before(populateDB);
    it('Should accept the connection', function testAcceptConnection(done) {
      authentication.liveAuthorize(handshakes.validPresenter,
        function(err, authorized) {
          expect(err).to.not.exist;
          expect(authorized).to.be.true;
          done();
      });
    });
    it('Should set the session in the handshake', function testSetSession(){
      var keysToTest = ['_id', 'startDate', 'activeSlide', 'authLevel'];
      for (var key in keysToTest) {
        expect(handshakes.validPresenter.session[key]).to.deep.equal(
          fixtures.Session[0][key]);
        // For some reason to.have(.deep).property(key, value) does not work.
        }
    });
    it('Should set the "screenName in the handshake', function testSetScreenName() {
      expect(handshakes.validPresenter.screenName).to.equal(
        fixtures.WhitelistEntry[0].screenName);
    });
  });
});
