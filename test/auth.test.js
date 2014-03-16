var chai      = require('chai')
  , sinon     = require("sinon")
  , sinonChai = require("sinon-chai")
  , expect    = chai.expect
  , mongoose  = require('mongoose')
  , config    = require('../config');

db = mongoose.createConnection(config.mongoDBServer, config.dbName,
        config.mongoDBPort);

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
        if (tasks.done == tasks.total) {
          done();
        }
      });
    });
  });
}

describe('authentication.authorizeSession(req, res, next)' , function testSessionAuth() {
  describe('Public Session', function testPublic() {

    describe('Without headers', function withoutToken() {
      var req = reqs.missingHeaders;
      before(populateDB);
      it('Should refuse the connection wit the error: "Unable to retrieve cookie".',
        function testNoHeaders(done) {
          authentication.authorizeSession(req, null, function next(err) {
              expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
              done();
            });
        });
    });

    describe('Without a token (cookie)', function withoutToken() {
      var req = reqs.missingToken;
      before(populateDB);
      it('Should refuse the connection wit the error: "Unable to retrieve cookie".',
        function testNoHeaders(done) {
          authentication.authorizeSession(req, null, function next(err) {
              expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
              done();
            });
        });
    });

    describe('With a not whitelisted registered user', function regUserNotWhite() {
      var req = reqs.registeredNotWhite;
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection.', function testRegNotWhite(done) {
        authentication.authorizeSession(req, null, function next(err) {
          expect(err).to.not.exist;
          done();
        });
      });
      it('Should create a whitelist entry for the user.',
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
      it('Should set the whitelist entry in the request.',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property('token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property('screenName', req.user.screenName);
          expect(req.whitelistEntry).to.have.deep.property('uid')
          expect(req.whitelistEntry.uid.toString()).to.be.equal(req.user._id.toString());
          expect(req.whitelistEntry).to.have.deep.property('session')
          expect(req.whitelistEntry.session.toString()).to.be.equal(req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age.',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('With a whitelisted registered user', function regUserWhite() {
      var req = reqs.registeredWhite;
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      this.timeout(0);  
      it('Should accept the connection.', function testRegNotWhite(done){
        authentication.authorizeSession(req, null, function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should update the whitelist entry with the token (cookie).',
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
          })
        });
      it('Should set the whitelist entry in the request.',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property('token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property('screenName', req.user.screenName);
          expect(req.whitelistEntry).to.have.deep.property('uid');
          expect(req.whitelistEntry.uid.toString()).to.be.equal(req.user._id.toString());
          expect(req.whitelistEntry).to.have.deep.property('session');
          expect(req.whitelistEntry.session.toString()).to.be.equal(req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age.',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('With a new guest user', function newGuestUser() {
      this.timeout(0);
      var req = reqs.newGuest;
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection.', function testNewGuest(done){
        authentication.authorizeSession(req, null, function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should create a new guest user.',
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
      it('Should create a whitelist entry for the user.',
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
      it('Should set the whitelist entry in the request.',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property('token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property('screenName');
          //expect(req.whitelistEntry.uid.toString()).to.be.equal(ids.validGuest1.toString());
          expect(req.whitelistEntry).to.have.deep.property('session')
          expect(req.whitelistEntry.session.toString()).to.be.equal(req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age.',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('With an existing not whitelisted guest', function guestNotWhite() {
      var req = reqs.guestNotWhite;
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection.', function testGuestNotWhite(done){
        authentication.authorizeSession(req, null, function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should create a whitelist entry for the user.',
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
      it('Should set the whitelist entry in the request.',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property('token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property('screenName', fixtures.GuestUser[1].screenName);
          expect(req.whitelistEntry).to.have.deep.property('uid');
          expect(req.whitelistEntry.uid.toString()).to.be.equal(ids.validGuest2.toString());
          expect(req.whitelistEntry).to.have.deep.property('session')
          expect(req.whitelistEntry.session.toString()).to.be.equal(req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age.',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });

    describe('With an existing whitelisted guest', function guestWhite() {
      var req = reqs.guestWhite;
      var touchSpy = sinon.spy(req.session.touch);
      req.session.touch = touchSpy;
      before(populateDB);
      it('Should accept the connection.', function testGuestWhite(done){
        authentication.authorizeSession(req, null,
          function next(err) {
            expect(err).to.not.exist;
            done();
          });
      });
      it('Should update the whitelist entry with the token (cookie).',
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
          })
        });
      it('Should set the whitelist entry in the request.',
        function testSetEntry(done) {
          expect(req.whitelistEntry).to.exist;
          expect(req.whitelistEntry).to.have.property('token', req.headers.cookie);
          expect(req.whitelistEntry).to.have.property('screenName', fixtures.GuestUser[0].screenName);
          expect(req.whitelistEntry).to.have.property('uid');
          expect(req.whitelistEntry.uid.toString()).to.be.equal(ids.validGuest1.toString());
          expect(req.whitelistEntry).to.have.deep.property('session')
          expect(req.whitelistEntry.session.toString()).to.be.equal(req.liveSession._id.toString());
          expect(req.whitelistEntry).to.have.property('role', 'viewer');
          done();
        });
      it('Should reset the cookie\'s max age.',
        function testCookieReset(done) {
          expect(touchSpy).to.have.been.calledOnce;
          done();
        });
    });
  });
});