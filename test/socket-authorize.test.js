var chai           = require('chai')
  , expect         = chai.expect
  , mongoose       = require('mongoose')
  , config         = require('../config');

db = mongoose.createConnection(config.mongoDBServer, config.dbName,
        config.mongoDBPort);

var mongooseFixtures = require('./util/mongoose-fixtures')
  , authFixtures     = require('./fixtures/auth.fixtures')
  , ids              = authFixtures.ids
  , fixtures         = authFixtures.fixtures
  , handshakes       = authFixtures.handshakes
  , proxyquire       = require('proxyquire')
  , stub             = {
      presUtils : require('../lib/utils').presentation,
      auth: { getSessionFromCookie : function(cookie) { return cookie; }}
    }
  , authentication = proxyquire('../lib/authentication', { './utils' : stub});

describe('authentication.ctrlAuthorize(handshakeData)', function testCtrlAuth() {
  beforeEach(function populateDB(done) {
    mongooseFixtures.load(fixtures, db, function(err){
        if (err) {
          done(err);
        }
        done();
      });
  });

  describe('With an empty handshake', function(){
    it('Should refuse the connection with the error: "Missing Session".',
      function testEmptyHandshake (done) {
        authentication.ctrlAuthorize(handshakes.empty, function(err, authorized) {
        expect(err).to.deep.equal(new Error('Missing session'));
        expect(authorized).to.be.false;
        done();
      });
    });
  });

  describe('Without a query', function(){
    it('Should refuse the connection with the error: "Missing Session".',
      function testNoQuery (done) {
        authentication.ctrlAuthorize(handshakes.missingQuery, function(err, authorized) {
        expect(err).to.deep.equal(new Error('Missing session'));
        expect(authorized).to.be.false;
        done();
      });
    });
  });

  describe('Without a session id', function(){
    it('Should refuse the connection with the error: "Missing Session".',
      function testNoSessionId (done) {
        authentication.ctrlAuthorize(handshakes.missingSessionId, function(err, authorized) {
        expect(err).to.deep.equal(new Error('Missing session'));
        expect(authorized).to.be.false;
        done();
      });
    });
  });

  describe('Without headers', function(){
    it('Should refuse the connection with the error: "Not authenticated or missing cookie".',
      function testNoHeaders (done) {
        authentication.ctrlAuthorize(handshakes.missingHeaders, function(err, authorized) {
        expect(err).to.deep.equal(new Error('Not authenticated or missing cookie'));
        expect(authorized).to.be.false;
        done();
      });
    });
  });

  describe('Without a token (cookie)', function(){
    it('Should refuse the connection with the error: "Not authenticated or missing cookie".',
      function testNoToken (done) {
        authentication.ctrlAuthorize(handshakes.missingToken, function(err, authorized) {
        expect(err).to.deep.equal(new Error('Not authenticated or missing cookie'));
        expect(authorized).to.be.false;
        done();
      });
    });
  });

  describe('With an invalid session id', function(){
    it('Should refuse the connection with the error: "Not authorized".',
      function testBadSessionId (done) {
        authentication.ctrlAuthorize(handshakes.invalidSession, function(err, authorized) {
        expect(err).to.deep.equal(new Error('Not authorized'));
        expect(authorized).to.be.false;
        done();
      });
    });
  });

  describe('With an invalid token (cookie)', function(){
    it('Should refuse the connection with the error: "Not authorized".',
      function testBadToken (done) {
        authentication.ctrlAuthorize(handshakes.invalidToken, function(err, authorized) {
        expect(err).to.deep.equal(new Error('Not authorized'));
        expect(authorized).to.be.false;
        done();
      });
    });
  });

  describe('With invalid session id and token', function(){
    it('Should refuse the connection with the error: "Not authorized".',
      function testBadSessionIdAndToken (done) {
        authentication.ctrlAuthorize(handshakes.invalidSessionAndToken, function(err, authorized) {
        expect(err).to.deep.equal(new Error('Not authorized'));
        expect(authorized).to.be.false;
        done();
      });
    });
  });

  describe('With a user who has a "viewer" role', function(){
    it('Should refuse the connection with the error: "Not authorized".',
      function testUserIsViewer (done) {
        authentication.ctrlAuthorize(handshakes.validViewer, function(err, authorized) {
        expect(err).to.deep.equal(new Error('Not authorized'));
        expect(authorized).to.be.false;
        done();
      });
    });
  });

  describe('With a valid user.', function(){
    it('Should accept the connection.', function testAccept(done) {
      authentication.ctrlAuthorize(handshakes.validPresenter, function(err, authorized) {
        expect(err).to.not.exist;
        expect(authorized).to.be.true;
        done();
      });
     });
    it('Should set the session in the handshake.', function testSetSession(){
      var keysToTest = ['_id', 'startDate', 'activeSlide', 'authLevel'];
      for (var key in keysToTest) {
        expect(handshakes.validPresenter.session[key]).to.deep.equal(fixtures.Session[0][key]);
        // For some reason to.have(.deep).property(key, value) does not work.
        }
    });
    it('Should set the "screenName in the handshake.', function testSetScreenName() {
      expect(handshakes.validPresenter.screenName).to.equal(fixtures.WhitelistEntry[0].screenName);
    });
  });

});


