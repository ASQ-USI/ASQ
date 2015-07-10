/**
  @fileoverview tests for lib/authnetication.js for ASQ
**/
/* global describe : true */
/* global before : true */
/* global after : true */
/* global it : true */
/* global db : true */

var chai      = require('chai')
  , sinon     = require("sinon")
  , sinonChai = require("sinon-chai")
  , expect    = chai.expect
  , mongoose  = require('mongoose')
  , config    = require('../config');

db = mongoose.createConnection(config.mongo.mongoUri);

require('../models'); //Load db models.

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
      return;
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

    describe('without sessionID:', function withoutToken() {
      var req = reqs.public.missingSessionID;
      before(populateDB);
      it('Should refuse the connection with the error: "Unable to retrieve cookie"',
        function testNoSessionID(done) {
          authentication.authorizeSession(req, null, function next(err) {
              expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
              done();
            });
        });
    });

    describe('with a not whitelisted registered user:', function regUserNotWhite() {
      var req = reqs.public.registeredNotWhite;
      var originalTouch = req.session.touch;
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
            token: req.sessionID,
            screenName: req.user.screenName,
            user: req.user._id,
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
          expect(req.whitelistEntry).to.have.property('token', req.sessionID);
          expect(req.whitelistEntry).to.have.property(
            'screenName', req.user.screenName);
          expect(req.whitelistEntry).to.have.deep.property('user')
          expect(req.whitelistEntry.user.toString()).to.be.equal(
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
      after(function tearDown() {
        req.session.touch = originalTouch;
      });
    });

    describe('with a whitelisted registered user:', function regUserWhite() {
      var req = reqs.public.registeredWhite;
      var originalTouch = req.session.touch;
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
            user        : req.user._id,
            screenName : req.user.screenName,
            token      : req.sessionID,
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
            'token', req.sessionID);
          expect(req.whitelistEntry).to.have.property(
            'screenName', req.user.screenName);
          expect(req.whitelistEntry).to.have.deep.property('user');
          expect(req.whitelistEntry.user.toString()).to.be.equal(
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
      after(function tearDown() {
        req.session.touch = originalTouch;
      });
    });

    describe('with a new guest user:', function newGuestUser() {
      this.timeout(0);
      var req = reqs.public.newGuest;
      var originalTouch = req.session.touch;
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
            token: req.sessionID,
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
            token: req.sessionID,
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
            'token', req.sessionID);
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
      after(function tearDown() {
        req.session.touch = originalTouch;
      });
    });

    describe('with an existing not whitelisted guest:', function guestNotWhite() {
      var req = reqs.public.guestNotWhite;
      var originalTouch = req.session.touch;
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
            token: req.sessionID,
            screenName: fixtures.GuestUser[1].screenName,
            user: ids.validGuest2,
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
            'token', req.sessionID);
          expect(req.whitelistEntry).to.have.property(
            'screenName', fixtures.GuestUser[1].screenName);
          expect(req.whitelistEntry).to.have.deep.property('user');
          expect(req.whitelistEntry.user.toString()).to.be.equal(
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
      after(function tearDown() {
        req.session.touch = originalTouch;
      });
    });

    describe('with an existing whitelisted guest:', function guestWhite() {
      var req = reqs.public.guestWhite;
      var originalTouch = req.session.touch;
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
            user        : ids.validGuest1,
            screenName : fixtures.GuestUser[0].screenName,
            token      : req.sessionID,
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
            'token', req.sessionID);
          expect(req.whitelistEntry).to.have.property(
            'screenName', fixtures.GuestUser[0].screenName);
          expect(req.whitelistEntry).to.have.property('user');
          expect(req.whitelistEntry.user.toString()).to.be.equal(
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
      after(function tearDown() {
        req.session.touch = originalTouch;
      });
    });
  });
  describe('Anonymous Session', function testPublic() {

    describe('without sessionID:', function withoutToken() {
      var req = reqs.anonymous.missingSessionID;
      //req.liveSession.authLevel = 'anonymous';
      before(populateDB);
      it('Should refuse the connection wit the error: "Unable to retrieve cookie"',
        function testNoSessionID(done) {
          authentication.authorizeSession(req, null, function next(err) {
              expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
              done();
            });
        });
    });

    describe('with a not whitelisted registered user:', function regUserNotWhite() {
      var req = reqs.anonymous.registeredNotWhite;
      //req.liveSession.authLevel = 'anonymous';
      var originalTouch = req.session.touch;
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
            token: req.sessionID,
            screenName: req.user.screenName,
            user: req.user._id,
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
          expect(req.whitelistEntry).to.have.property('token', req.sessionID);
          expect(req.whitelistEntry).to.have.property(
            'screenName', req.user.screenName);
          expect(req.whitelistEntry).to.have.deep.property('user')
          expect(req.whitelistEntry.user.toString()).to.be.equal(
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
      after(function tearDown() {
        req.session.touch = originalTouch;
      });
    });

    describe('with a whitelisted registered user:', function regUserWhite() {
      var req = reqs.anonymous.registeredWhite;
      //req.liveSession.authLevel = 'anonymous';
      var originalTouch = req.session.touch;
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
            user        : req.user._id,
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
          expect(req.whitelistEntry).to.have.deep.property('user');
          expect(req.whitelistEntry.user.toString()).to.be.equal(
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
      after(function tearDown() {
        req.session.touch = originalTouch;
      });
    });

    describe('with a new guest user:', function newGuestUser() {
      this.timeout(0);
      var req = reqs.anonymous.newGuest;
      //req.liveSession.authLevel = 'anonymous';
      var originalTouch = req.session.touch;
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
      after(function tearDown() {
        req.session.touch = originalTouch;
      });
    });

    describe('with an existing not whitelisted guest:', function guestNotWhite() {
      var req = reqs.anonymous.guestNotWhite;
      //req.liveSession.authLevel = 'anonymous';
      var originalTouch = req.session.touch;
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
            user: ids.validGuest2,
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
          expect(req.whitelistEntry).to.have.deep.property('user');
          expect(req.whitelistEntry.user.toString()).to.be.equal(
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
      after(function tearDown() {
        req.session.touch = originalTouch;
      });
    });

    describe('with an existing whitelisted guest:', function guestWhite() {
      var req = reqs.anonymous.guestWhite;
      //req.liveSession.authLevel = 'anonymous';
      var originalTouch = req.session.touch;
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
            user        : ids.validGuest1,
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
          expect(req.whitelistEntry).to.have.property('user');
          expect(req.whitelistEntry.user.toString()).to.be.equal(
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
      after(function tearDown() {
        req.session.touch = originalTouch;
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
        authentication.ctrlAuthorize(handshakes.public.empty, function(err, authorized) {
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
        authentication.ctrlAuthorize(handshakes.public.missingQuery,
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
        authentication.ctrlAuthorize(handshakes.public.missingSessionId,
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
        authentication.ctrlAuthorize(handshakes.public.missingHeaders,
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
        authentication.ctrlAuthorize(handshakes.public.missingToken,
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
        authentication.ctrlAuthorize(handshakes.public.invalidSession,
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
        authentication.ctrlAuthorize(handshakes.public.invalidToken,
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
        authentication.ctrlAuthorize(handshakes.public.invalidSessionAndToken,
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
        authentication.ctrlAuthorize(handshakes.public.validViewer,
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
      authentication.ctrlAuthorize(handshakes.public.validPresenter,
        function(err, authorized) {
          expect(err).to.not.exist;
          expect(authorized).to.be.true;
          done();
      });
     });
    it('Should set the session in the handshake', function testSetSession(){
      var keysToTest = ['_id', 'startDate', 'activeSlide', 'authLevel'];
      for (var key in keysToTest) {
        expect(handshakes.public.validPresenter.session[key]).to.deep.equal(
          fixtures.Session[0][key]);
        // For some reason to.have(.deep).property(key, value) does not work.
        }
    });
    it('Should set the "screenName in the handshake', function testSetScreenName() {
      expect(handshakes.public.validPresenter.screenName).to.equal(
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
        authentication.liveAuthorize(handshakes.public.empty, function(err, granted) {
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
        authentication.liveAuthorize(handshakes.public.missingQuery,
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
        authentication.liveAuthorize(handshakes.public.missingSessionId,
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
        authentication.liveAuthorize(handshakes.public.missingHeaders,
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
        authentication.liveAuthorize(handshakes.public.missingToken,
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
        authentication.liveAuthorize(handshakes.public.invalidSession,
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
        authentication.liveAuthorize(handshakes.public.invalidToken,
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
        authentication.liveAuthorize(handshakes.public.invalidSessionAndToken,
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
        authentication.liveAuthorize(handshakes.public.validViewer,
          function(err, authorized) {
            expect(err).to.not.exist;
            expect(authorized).to.be.true;
            done();
        });
    });
    it('Should set the session in the handshake', function testSetSession(){
      var keysToTest = ['_id', 'startDate', 'activeSlide', 'authLevel'];
      for (var key in keysToTest) {
        expect(handshakes.public.validViewer.session[key]).to.deep.equal(
          fixtures.Session[0][key]);
        // For some reason to.have(.deep).property(key, value) does not work.
        }
    });
    it('Should set the "screenName in the handshake', function testSetScreenName() {
      expect(handshakes.public.validViewer.screenName).to.equal(
        fixtures.WhitelistEntry[1].screenName);
    });
  });

  describe('with a user who has a "presenter" role:', function testPresenter(){
    before(populateDB);
    it('Should accept the connection', function testAcceptConnection(done) {
      authentication.liveAuthorize(handshakes.public.validPresenter,
        function(err, authorized) {
          expect(err).to.not.exist;
          expect(authorized).to.be.true;
          done();
      });
    });
    it('Should set the session in the handshake', function testSetSession(){
      var keysToTest = ['_id', 'startDate', 'activeSlide', 'authLevel'];
      for (var key in keysToTest) {
        expect(handshakes.public.validPresenter.session[key]).to.deep.equal(
          fixtures.Session[0][key]);
        // For some reason to.have(.deep).property(key, value) does not work.
        }
    });
    it('Should set the "screenName in the handshake', function testSetScreenName() {
      expect(handshakes.public.validPresenter.screenName).to.equal(
        fixtures.WhitelistEntry[0].screenName);
    });
  });
});
