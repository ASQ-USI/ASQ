/**
  @fileoverview tests for lib/authnetication.js for ASQ
**/

'use strict';

const chai = require('chai');
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('../../../config');
const SandboxedModule = require('sandboxed-module');
const modulePath = '../../../lib/authentication';

const authFixtures = require('./fixtures/auth.fixtures');
const reqs = authFixtures.reqs;

chai.use(sinonChai);

function expectReqWhiteListEntry(req, user){
  expect(req.whitelistEntry).to.exist;
  expect(req.whitelistEntry).to.have.property(
    'browserSessionId', req.sessionID);
  expect(req.whitelistEntry).to.have.property(
    'screenName', user.screenName);
  expect(req.whitelistEntry).to.have.deep.property('user');
  expect(req.whitelistEntry.user).to.be.equal( user._id);
  expect(req.whitelistEntry).to.have.deep.property('session');
  expect(req.whitelistEntry.session).to.be.equal( req.liveSession._id);
  expect(req.whitelistEntry).to.have.property('role', 'viewer');
}

describe('authentication.js', function(){
  before(function(){

    this.GuestUserModel = sinon.stub();
    this.GuestUserModel.findOne = sinon.stub().returns({
      exec: function(){
        return Promise.resolve(true);
      }
    });

    this.WhitelistEntryModel = sinon.stub();
    this.WhitelistEntryModel.findOne = sinon.stub().returns({
      exec: function(){
        return Promise.resolve(true);
      }
    })

    //mock db
    this.db = {model: sinon.stub()};
    this.db.model
      .withArgs('GuestUser').returns(this.GuestUserModel)
      .withArgs('WhitelistEntry').returns(this.WhitelistEntryModel)

    this.sillyname = sinon.stub();


    const authentication = this.authentication = SandboxedModule.require(modulePath, {
      requires: {
        "sillyname" : this.sillyname
      },
      globals : {
        db : this.db
      }
    });
  });

  describe('authentication.authorizeLiveSession(req, res, next)', function session() {
    describe('Anonymous Session', function testAnonymous() {

      describe('without sessionID:', function withoutToken() {
        var req = reqs.public.missingSessionID;

        it('Should refuse the connection with the error: "Unable to retrieve cookie"',
          function testNoSessionID(done) {
            this.authentication.authorizeLiveSession(req, null, function next(err) {
                expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
                done();
              });
          });
      });

      describe('with a not whitelisted registered user:', function regUserNotWhite() {
        before(function(done){
          this.req = reqs.public.registeredNotWhite;
          sinon.spy(this.req.session, "touch");
          this.leUser = this.req.user

          this.GuestUserModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(this.req.user);
            }
          });

          this.wlEntry = {
            user    : this.leUser._id,
            session : this.req.liveSession._id,
            browserSessionId: this.req.sessionID,
            screenName:  this.leUser.screenName,
            role: "viewer",
            markModified: sinon.stub(),
            save: sinon.stub().returns(Promise.resolve({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName,
              role: "viewer",
            }))
          }

          this.WhitelistEntryModel.returns(this.wlEntry);

          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(null);
            }
          });
          sinon.stub(this.req, "isAuthenticated").returns(true);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.req.session.touch.restore();
          this.GuestUserModel.reset()
          this.GuestUserModel.findOne.reset()
          this.WhitelistEntryModel.reset()
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should accept the connection', function testAcceptConnection() {
          expect(this.err).to.not.exist;
        });

        it('Should create a whitelist entry for the user', function(){
          expect(this.WhitelistEntryModel).to.have.been.calledOnce;
          expect(this.WhitelistEntryModel).to.have.been.calledWithExactly({
            user    : this.leUser._id,
            session : this.req.liveSession._id,
            browserSessionId: this.req.sessionID,
            screenName:  this.leUser.screenName
          });
          expect(this.wlEntry.markModified).to.have.been.calledOnce;
          expect(this.wlEntry.save).to.have.been.calledOnce;
          expect(this.wlEntry.markModified).to.have.been.calledWithExactly("sessionData");
        });

        it('Should set the whitelist entry in the request',
          function testSetEntry() {
            expectReqWhiteListEntry(this.req, this.leUser);
        });

        it('Should reset the cookie\'s max age',
          function testCookieReset() {
            expect(this.req.session.touch).to.have.been.calledOnce;
        });
      });

      describe('with a whitelisted registered user:', function regUserWhite() {

        before(function(done){
          this.req = reqs.public.registeredWhite;
          sinon.spy(this.req.session, "touch");
          this.leUser = this.req.user

          this.GuestUserModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(this.req.user);
            }
          });

          this.wlEntry = {
            user    : this.leUser._id,
            session : this.req.liveSession._id,
            browserSessionId: this.req.sessionID,
            screenName:  this.leUser.screenName,
            role: "viewer",
            markModified: sinon.stub(),
            save: sinon.stub().returns(Promise.resolve({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName,
              role: "viewer",
            }))
          }

          this.WhitelistEntryModel.returns(null)

          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(this.wlEntry);
            }.bind(this)
          });
          sinon.stub(this.req, "isAuthenticated").returns(true);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.req.session.touch.restore();
          this.GuestUserModel.reset()
          this.GuestUserModel.findOne.reset()
          this.WhitelistEntryModel.reset()
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should accept the connection', function testRegNotWhite(){
          expect(this.err).to.not.exist;
        });

        it('Should update the whitelist entry with the token (cookie)',
          function updateWhitelist() {
            expect(this.wlEntry.save).to.have.been.calledOnce;
        });

        it('Should set the whitelist entry in the request',
          function testSetEntry() {
            expectReqWhiteListEntry(this.req, this.leUser);
        });

        it('Should reset the cookie\'s max age',
          function testCookieReset() {
            expect(this.req.session.touch).to.have.been.calledOnce;
        });
      });

      describe('with a new guest user:', function newGuestUser() {
        before(function(done){
          this.req = reqs.public.newGuest;
          sinon.spy(this.req.session, "touch");
          sinon.stub(this.req.session, "save").callsArg(0);
          this.leUser = {
            _id : "guestUserId",
            browserSessionId : this.req.sessionID,
            screenName : "guestUser",
            save: sinon.stub().returns(Promise.resolve({
              _id : "guestUserId",
              browserSessionId : this.req.sessionID,
              screenName : "guestUser",
            }))
          }

          this.GuestUserModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(null);
            }
          });
          this.GuestUserModel.returns(this.leUser);

          this.wlEntry = {
            user    : this.leUser._id,
            session : this.req.liveSession._id,
            browserSessionId: this.req.sessionID,
            screenName:  this.leUser.screenName,
            role: "viewer",
            markModified: sinon.stub(),
            save: sinon.stub().returns(Promise.resolve({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName,
              role: "viewer"
            }))
          }

          this.WhitelistEntryModel.returns(this.wlEntry)
          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(null);
            }
          });
          sinon.stub(this.req, "isAuthenticated").returns(false);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.req.session.touch.restore();
          this.req.session.save.restore();
          this.GuestUserModel.reset()
          this.GuestUserModel.findOne.reset()
          this.WhitelistEntryModel.reset()
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should accept the connection', function testNewGuest(){
          expect(this.err).to.not.exist;
        });

        it('should mark the session as a guest session', function(){
          expect(this.req.session.isGuest).to.be.true;
          expect(this.req.session.save).to.have.been.calledOnce;
        });

        it('Should create a new guest user',
          function createdUser(){
            expect(this.GuestUserModel).to.have.been.calledOnce;
            expect(this.GuestUserModel).to.have.been.calledWith({
              browserSessionId: this.req.sessionID,
              screenName : undefined
            });
            expect(this.sillyname).to.have.been.calledOnce;
        });

        it('Should create a whitelist entry for the user',
          function createdEntry(){
            expect(this.WhitelistEntryModel).to.have.been.calledOnce;
            expect(this.WhitelistEntryModel).to.have.been.calledWithExactly({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName
            });
            expect(this.wlEntry.markModified).to.have.been.calledOnce;
            expect(this.wlEntry.save).to.have.been.calledOnce;
            expect(this.wlEntry.markModified).to.have.been.calledWithExactly("sessionData");
        });

        it('Should set the whitelist entry in the request',
          function testSetEntry() {
            expectReqWhiteListEntry(this.req, this.leUser);
        });

        it('Should reset the cookie\'s max age',
          function testCookieReset() {
            expect(this.req.session.touch).to.have.been.calledOnce;
        });
      });

      describe('with an existing not whitelisted guest:', function guestNotWhite() {
        before(function(done){
          this.req = reqs.public.guestNotWhite;
          sinon.spy(this.req.session, "touch");
          this.leUser = {
            _id : "guestUserId",
            browserSessionId : this.req.sessionID,
            screenName : "guestUser"
          }

          this.GuestUserModel.returns(null);
          this.GuestUserModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(this.leUser);
            }.bind(this)
          });

          this.wlEntry = {
            user    : this.leUser._id,
            session : this.req.liveSession._id,
            browserSessionId: this.req.sessionID,
            screenName:  this.leUser.screenName,
            role: "viewer",
            markModified: sinon.stub(),
            save: sinon.stub().returns(Promise.resolve({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName,
              role: "viewer"
            }))
          }

          this.WhitelistEntryModel.returns(this.wlEntry)
          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(null);
            }
          });
          sinon.stub(this.req, "isAuthenticated").returns(false);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.req.session.touch.restore();
          this.GuestUserModel.reset()
          this.GuestUserModel.findOne.reset()
          this.WhitelistEntryModel.reset()
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should accept the connection', function testGuestNotWhite(){
          expect(this.err).to.not.exist;
        });

        it('Should create a whitelist entry for the user',
          function createdEntry(){
            expect(this.WhitelistEntryModel).to.have.been.calledOnce;
            expect(this.WhitelistEntryModel).to.have.been.calledWithExactly({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName
            });
            expect(this.wlEntry.markModified).to.have.been.calledOnce;
            expect(this.wlEntry.save).to.have.been.calledOnce;
            expect(this.wlEntry.markModified).to.have.been.calledWithExactly("sessionData");
        });

        it('Should set the whitelist entry in the request',
          function testSetEntry() {
            expectReqWhiteListEntry(this.req, this.leUser)
        });

        it('Should reset the cookie\'s max age',
          function testCookieReset() {
            expect(this.req.session.touch).to.have.been.calledOnce;
        });
      });

      describe('with an existing whitelisted guest:', function guestWhite() {
        before(function(done){
          this.req = reqs.public.guestWhite;
          sinon.spy(this.req.session, "touch");
          this.leUser = {
            _id : "guestUserId",
            browserSessionId : this.req.sessionID,
            screenName : "guestUser"
          }

          this.GuestUserModel.returns(null);
          this.GuestUserModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(this.leUser);
            }.bind(this)
          });

          this.wlEntry = {
            user    : this.leUser._id,
            session : this.req.liveSession._id,
            browserSessionId: this.req.sessionID,
            screenName:  this.leUser.screenName,
            role: "viewer",
            markModified: sinon.stub(),
            save: sinon.stub().returns(Promise.resolve({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName,
              role: "viewer"
            }))
          }

          this.WhitelistEntryModel.returns()
          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(this.wlEntry);
            }.bind(this)
          });
          sinon.stub(this.req, "isAuthenticated").returns(false);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.req.session.touch.restore();
          this.GuestUserModel.reset()
          this.GuestUserModel.findOne.reset()
          this.WhitelistEntryModel.reset()
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should accept the connection', function testGuestWhite(){
            expect(this.err).to.not.exist;
        });

        it('Should update the whitelist entry with the token (cookie)',
          function updateWhitelist() {
            expect(this.wlEntry.save).to.have.been.calledOnce;
        });

        it('Should set the whitelist entry in the request',
          function testSetEntry() {
            expectReqWhiteListEntry(this.req, this.leUser)
         });

        it('Should reset the cookie\'s max age',
          function testCookieReset() {
            expect(this.req.session.touch).to.have.been.calledOnce;
        });
      });
    });


    describe('Anonymous Session', function testAnonymous() {
      describe('without sessionID:', function withoutToken() {
        var req = reqs.anonymous.missingSessionID;

        it('Should refuse the connection with the error: "Unable to retrieve cookie"',
          function testNoSessionID(done) {
            this.authentication.authorizeLiveSession(req, null, function next(err) {
                expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
                done();
              });
          });
      });

      describe('with a not whitelisted registered user:', function regUserNotWhite() {
        before(function(done){
          this.req = reqs.anonymous.registeredNotWhite;
          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(null);
            }
          });
          sinon.stub(this.req, "isAuthenticated").returns(true);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.WhitelistEntryModel.reset()
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should refuse the connection with the error: "Can\'t access this session"',
          function testNoWhitelisted() {
            expect(this.err).to.deep.equal(new Error('Can\'t access this session'));
          });
      });

      describe('with a whitelisted registered user:', function regUserWhite() {
        before(function(done){
          this.req = reqs.anonymous.registeredWhite;
          sinon.spy(this.req.session, "touch");
          this.leUser = this.req.user;
          this.wlEntry = {
            user    : this.leUser._id,
            session : this.req.liveSession._id,
            browserSessionId: this.req.sessionID,
            screenName:  this.leUser.screenName,
            role: "viewer",
            markModified: sinon.stub(),
            save: sinon.stub().returns(Promise.resolve({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName,
              role: "viewer"
            }))
          }
          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(this.wlEntry);
            }.bind(this)
          });
          sinon.stub(this.req, "isAuthenticated").returns(true);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.req.session.touch.restore();
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should accept the connection', function testAcceptConnection() {
          expect(this.err).to.not.exist;
        });

        it('Should set the whitelist entry in the request',
          function testSetEntry() {
            expectReqWhiteListEntry(this.req, this.leUser)
          });

        it('Should reset the cookie\'s max age',
          function testCookieReset() {
            expect(this.req.session.touch).to.have.been.calledOnce;
        });
      });

      describe('with a whitelisted registered user with a different session:', function regUserWhite() {
        before(function(done){
          this.req = reqs.anonymous.registeredWhite;
          sinon.spy(this.req.session, "touch");
          this.leUser = this.req.user;
          this.wlEntry = {
            user    : this.leUser._id,
            session : this.req.liveSession._id,
            browserSessionId: "differentSessionId",
            screenName:  this.leUser.screenName,
            role: "viewer",
            markModified: sinon.stub(),
            save: sinon.stub().returns(Promise.resolve({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName,
              role: "viewer"
            }))
          }
          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(this.wlEntry);
            }.bind(this)
          });
          sinon.stub(this.req, "isAuthenticated").returns(true);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.req.session.touch.restore();
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should accept the connection', function testAcceptConnection() {
          expect(this.err).to.not.exist;
        });

        it('Should update the whitelist entry with the token (cookie)',
          function updateWhitelist() {
           expect(this.wlEntry.save).to.have.been.calledOnce;
        });

        it('Should set the whitelist entry in the request',
          function testSetEntry() {
            expectReqWhiteListEntry(this.req, this.leUser)
          });

        it('Should reset the cookie\'s max age',
          function testCookieReset() {
            expect(this.req.session.touch).to.have.been.calledOnce;
        });
      });
    });
    
    describe('Private Session', function testPrivate() {
      describe('without sessionID:', function withoutToken() {
        var req = reqs.private.missingSessionID;

        it('Should refuse the connection <wit></wit>h the error: "Unable to retrieve cookie"',
          function testNoSessionID(done) {
            this.authentication.authorizeLiveSession(req, null, function next(err) {
                expect(err).to.deep.equal(new Error('Unable to retrieve cookie'));
                done();
              });
          });
      });

      describe('with a not whitelisted registered user:', function regUserNotWhite() {
        before(function(done){
          this.req = reqs.private.registeredNotWhite;
          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(null);
            }
          });
          sinon.stub(this.req, "isAuthenticated").returns(true);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.WhitelistEntryModel.reset()
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should refuse the connection with the error: "Can\'t access this session"',
          function testNoWhitelisted() {
            expect(this.err).to.deep.equal(new Error('Can\'t access this session'));
          });
      });

      describe('with a whitelisted registered user:', function regUserWhite() {
        before(function(done){
          this.req = reqs.private.registeredWhite;
          sinon.spy(this.req.session, "touch");
          this.leUser = this.req.user;
          this.wlEntry = {
            user    : this.leUser._id,
            session : this.req.liveSession._id,
            browserSessionId: this.req.sessionID,
            screenName:  this.leUser.screenName,
            role: "viewer",
            markModified: sinon.stub(),
            save: sinon.stub().returns(Promise.resolve({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName,
              role: "viewer"
            }))
          }
          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(this.wlEntry);
            }.bind(this)
          });
          sinon.stub(this.req, "isAuthenticated").returns(true);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.req.session.touch.restore();
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should accept the connection', function testAcceptConnection() {
          expect(this.err).to.not.exist;
        });

        it('Should set the whitelist entry in the request',
          function testSetEntry() {
            expectReqWhiteListEntry(this.req, this.leUser)
          });

        it('Should reset the cookie\'s max age',
          function testCookieReset() {
            expect(this.req.session.touch).to.have.been.calledOnce;
        });
      });

      describe('with a whitelisted registered user with a different session:', function regUserWhite() {
        before(function(done){
          this.req = reqs.private.registeredWhite;
          sinon.spy(this.req.session, "touch");
          this.leUser = this.req.user;
          this.wlEntry = {
            user    : this.leUser._id,
            session : this.req.liveSession._id,
            browserSessionId: "differentSessionId",
            screenName:  this.leUser.screenName,
            role: "viewer",
            markModified: sinon.stub(),
            save: sinon.stub().returns(Promise.resolve({
              user    : this.leUser._id,
              session : this.req.liveSession._id,
              browserSessionId: this.req.sessionID,
              screenName:  this.leUser.screenName,
              role: "viewer"
            }))
          }
          this.WhitelistEntryModel.findOne = sinon.stub().returns({
            exec: function(){
              return Promise.resolve(this.wlEntry);
            }.bind(this)
          });
          sinon.stub(this.req, "isAuthenticated").returns(true);

          // this is the call we're testing
          this.authentication.authorizeLiveSession(this.req, null, function next(err) {
            this.err = err;
            done();
          }.bind(this));
        });

        after(function(){
          this.req.isAuthenticated.restore();
          this.req.session.touch.restore();
          this.WhitelistEntryModel.findOne.reset()
        });

        it('Should accept the connection', function testAcceptConnection() {
          expect(this.err).to.not.exist;
        });

        it('Should update the whitelist entry with the token (cookie)',
          function updateWhitelist() {
           expect(this.wlEntry.save).to.have.been.calledOnce;
        });

        it('Should set the whitelist entry in the request',
          function testSetEntry() {
            expectReqWhiteListEntry(this.req, this.leUser)
          });

        it('Should reset the cookie\'s max age',
          function testCookieReset() {
            expect(this.req.session.touch).to.have.been.calledOnce;
        });
      });
    });

  });
});