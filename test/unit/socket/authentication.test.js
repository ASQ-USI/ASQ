const chai = require('chai');
const Promise = require('bluebird');
const SandboxedModule = require('sandboxed-module');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const should = chai.should();
const expect = chai.expect;
chai.use(sinonChai);
require('sinon-as-promised')(Promise);

const modulePath = '../../../lib/socket/authentication';
const fixtures = require('./fixtures/authentication.fixtures');

describe('lib/socket/authentication', function(){
  before(function(){
    const WhitelistEntryModel = this.WhitelistEntryModel = {
      findOne: sinon.stub()
    };
    const SessionModel = this.SessionModel = {
      findById: sinon.stub()
    };
    const GuestUserModel = this.GuestUserModel = {
      findById: sinon.stub()
    };
    const UserModel = this.UserModel = {
      findById: sinon.stub()
    };

    this.resetStubs = function(){
      this.WhitelistEntryModel.findOne.reset();
      this.SessionModel.findById.reset();
      this.GuestUserModel.findById.reset();
      this.UserModel.findById.reset();
    };

    this.db = {
      model : function(name){
        switch(name){
          case 'WhitelistEntry':
            return WhitelistEntryModel;
          case 'Session':
            return SessionModel;
          case 'GuestUser':
            return GuestUserModel;
          case 'User':
            return UserModel;
          default:
            return undefined;
        }
      }
    };

    this.authentication = SandboxedModule.require(modulePath, {
      globals : {
        db : this.db
      }
    });
  });

  describe('ctrlAuthorize()', function(){
    beforeEach(function(){
      this.resetStubs();
    });

    it('should throw an error if live session is missing', function(done){
      const socket = fixtures.socketMissingSession;
      const next = function(err){
        should.exist(err);
        err.message.should.equal('Missing session');
        done();
      };

      this.authentication.ctrlAuthorize(socket, next);
    });

    it('should throw an error if the user is missing', function(done){
      const socket = fixtures.socketMissingUser;

      const next = function(err){
        should.exist(err);
        err.message.should.equal('Missing user');
        done();
      };

      this.authentication.ctrlAuthorize(socket, next);
    });

    it('should throw an error if there is no corresponding session', function(done){
      const socket = fixtures.socketNonExistingSession;

      this.SessionModel.findById.returns({
        exec: function(){
          return Promise.resolve(undefined)
        }
      });

      const next = function(err){
        should.exist(err);
        err.message.should.equal('Unable to find session');
        this.SessionModel.findById.calledWith(socket.request._query.asq_sid)
          .should.equal(true);
        done();
      }.bind(this);

      this.authentication.ctrlAuthorize(socket, next);
    });

    it('should throw an error if there is no corresponding whitelist entry', function(done){
      const socket = fixtures.socketUnauthorisedPresenter;

      this.SessionModel.findById.returns({
        exec: function(){
          return Promise.resolve({
            _id: socket.request._query.asq_sid
          })
        }
      });

      this.WhitelistEntryModel.findOne.returns({
        exec: function(){
          return Promise.resolve(undefined)
        }
      });

      const next = function(err){
        should.exist(err);
        err.message.should.equal('Not authorized');
        this.SessionModel.findById.calledWith(socket.request._query.asq_sid)
          .should.equal(true);
        this.WhitelistEntryModel.findOne.calledWith({
          user: socket.user._id,
          session: socket.request._query.asq_sid,
          role: 'presenter'
        }).should.equal(true);
        done();
      }.bind(this);

      this.authentication.ctrlAuthorize(socket, next);
    });

    it('should update the request object if the user and session are valid', function(done){
      const socket = fixtures.socketValidPresenter;

      this.WhitelistEntryModel.findOne.returns({
        exec: function(){
          return Promise.resolve({
            _id: socket.user._id,
            screenName: 'testScreenName'
          })
        }
      });

      this.SessionModel.findById.returns({
        exec: function(){
          return Promise.resolve({
            _id: socket.request._query.asq_sid
          })
        }
      });

      const next = function(err){
        should.not.exist(err);
        this.WhitelistEntryModel.findOne.calledWith({
          user: socket.user._id,
          session: socket.request._query.asq_sid,
          role: 'presenter'
        }).should.equal(true);
        this.SessionModel.findById.calledWith(socket.request._query.asq_sid)
          .should.equal(true);

        socket.request.sessionId.should.equal(socket.request._query.asq_sid);
        socket.request.token.should.equal(socket.user._id);
        socket.request.screenName.should.equal('testScreenName');
        done();
      }.bind(this);

      this.authentication.ctrlAuthorize(socket, next);
    });
  });

  describe('liveAuthorize()', function(){
    beforeEach(function(){
      this.resetStubs();
    });

    it('should throw an error if live session is missing', function(done){
      const socket = fixtures.socketMissingSessionLA;
      const next = function(err){
        should.exist(err);
        err.message.should.equal('Missing session');
        done();
      };

      this.authentication.liveAuthorize(socket, next);
    });

    it('should throw an error if the header is missing', function(done){
      const socket = fixtures.socketMissingHeaderLA;
      const next = function(err){
        should.exist(err);
        err.message.should.equal('Not authenticated or missing cookie');
        done();
      };

      this.authentication.liveAuthorize(socket, next);
    });

    it('should throw an error if the header.cookie is missing', function(done){
      const socket = fixtures.socketMissingHeaderCookieLA;
      const next = function(err){
        should.exist(err);
        err.message.should.equal('Not authenticated or missing cookie');
        done();;
      };

      this.authentication.liveAuthorize(socket, next);
    });

    it('should throw an error if there is no corresponding session', function(done){
      const socket = fixtures.socketNonExistingSessionLA;

      this.SessionModel.findById.returns({
        exec: function(){
          return Promise.resolve(undefined)
        }
      });

      const next = function(err){
        should.exist(err);
        err.message.should.equal('Unable to find session');
        this.SessionModel.findById.calledWith(socket.request._query.asq_sid)
          .should.equal(true);
        done();
      }.bind(this);

      this.authentication.liveAuthorize(socket, next);
    });

    describe('with a guest user', function(){
      before(function(){
        this.SessionModel.findById.returns({
          exec: function(){
            return Promise.resolve({
              _id: 'testlivessessionid'
            })
          }
        });
      })

      it('should throw an error if there is no corresponding whitelist entry', function(done){
        const socket = fixtures.socketUnauthorizedGuestLA;

        this.WhitelistEntryModel.findOne.returns({
          exec: function(){
            return Promise.resolve(undefined)
          }
        });

        const next = function(err){
          should.exist(err);
          err.message.should.equal('Not authorized');
          this.WhitelistEntryModel.findOne.calledWith({
            $or : [
              {browserSessionId   : socket.request.sessionID}, 
              { $and: [ {role    : 'presenter'}, {user : null} ]}
            ],
            session : socket.request._query.asq_sid,
          }).should.equal(true);
          done();
        }.bind(this);

        this.authentication.liveAuthorize(socket, next);
      });

      it('should throw an error if there is no corresponding GuestUser entry', function(done){
        const socket = fixtures.socketNonExistingGuestLA;
        this.WhitelistEntryModel.findOne.returns({
          exec: function(){
            return Promise.resolve({
              _id: 'testId',
              user: 'testUserId',
              screenName: 'testScreenName'
            })
          }
        });

        this.GuestUserModel.findById.returns({
          exec: function(){
            return Promise.resolve(undefined);
          }
        });

        // this.UserModel.findById.returns({
        //   exec: function(){
        //     return Promise.resolve(undefined);
        //   }
        // });

        const next = function(err){
          should.exist(err);
          err.message.should.equal('Unable to find user');

          this.GuestUserModel.findById.calledWith('testUserId').should.equal(true);
          // this.UserModel.findById.calledWith('testUserId').should.equal(true);
          done();
        }.bind(this);

        this.authentication.liveAuthorize(socket, next);
      });

      it('should update socket.request and socket.user object if the user and session are valid', function(done){
        const socket = fixtures.socketValidGuestLA;

        this.WhitelistEntryModel.findOne.returns({
          exec: function(){
            return Promise.resolve({
              _id: 'testId',
              user: 'testUserId',
              screenName: 'testScreenName'
            })
          }
        });

        this.GuestUserModel.findById.returns({
          exec: function(){
            return Promise.resolve({
              _id: 'testUserId'
            });
          }
        });

        const next = function(err){
          should.not.exist(err);

          socket.request.sessionId.should.equal(socket.request._query.asq_sid);
          socket.request.token.should.equal('testId');
          socket.request.screenName.should.equal('testScreenName');

          socket.user.should.deep.equal({_id: 'testUserId'});
          done();
        }.bind(this);

        this.authentication.liveAuthorize(socket, next);
      });
    });

    describe('with a registered user', function(){
      before(function(){
        this.SessionModel.findById.returns({
          exec: function(){
            return Promise.resolve({
              _id: 'testlivessessionid'
            })
          }
        });
      })

      it('should throw an error if there is no corresponding whitelist entry', function(done){
        const socket = fixtures.socketUnauthorizedRegisteredUserLA;

        this.WhitelistEntryModel.findOne.returns({
          exec: function(){
            return Promise.resolve(undefined)
          }
        });

        const next = function(err){
          should.exist(err);
          err.message.should.equal('Not authorized');
          this.WhitelistEntryModel.findOne.calledWith({
            $or : [
              {browserSessionId   : socket.request.sessionID}, 
              { $and: [ {role    : 'presenter'}, {user : socket.request.user._id} ]}
            ],
            session : socket.request._query.asq_sid,
          }).should.equal(true);
          done();
        }.bind(this);

        this.authentication.liveAuthorize(socket, next);
      });

      // it('should throw an error if there is no corresponding GuestUser entry', function(done){
      //   const socket = fixtures.socketNonExistingRegisteredUserLA;
      //   const socket = socket;
      //   this.WhitelistEntryModel.findOne.returns({
      //     exec: function(){
      //       return Promise.resolve({
      //         _id: 'testId',
      //         user: 'testUserId',
      //         screenName: 'testScreenName'
      //       })
      //     }
      //   });

      //   this.GuestUserModel.findById.returns({
      //     exec: function(){
      //       return Promise.resolve(undefined);
      //     }
      //   });

      //   this.UserModel.findById.returns({
      //     exec: function(){
      //       return Promise.resolve(undefined);
      //     }
      //   });

      //   const next = function(err){
      //     should.exist(err);
      //     err.message.should.equal('Unable to find user');

      //     this.GuestUserModel.findById.calledWith('testUserId').should.equal(true);
      //     this.UserModel.findById.calledWith('testUserId').should.equal(true);
      //     done();
      //   }.bind(this);

      //   this.authentication.liveAuthorize(socket, next);
      // });

      it('should update the socket.request and socket.user if the user and session are valid', function(done){
        const socket = fixtures.socketValidRegisteredUserLA;

        this.WhitelistEntryModel.findOne.returns({
          exec: function(){
            return Promise.resolve({
              _id: 'testId',
              user: 'testUserId',
              screenName: 'testScreenName'
            })
          }
        });

        const next = function(err){
          should.not.exist(err);

          socket.request.sessionId.should.equal(socket.request._query.asq_sid);
          socket.request.token.should.equal('testId');
          socket.request.screenName.should.equal('testScreenName');

          socket.user.should.deep.equal(socket.request.user);
          done();
        }.bind(this);

        this.authentication.liveAuthorize(socket, next);
      });
    });
  });

  describe('persistAuthenticatedUserToRedis()', function(){
    it('should return a socket middleware function', function(){
      const res = this.authentication.persistAuthenticatedUserToRedis();
      (typeof res).should.equal('function');
      res.length.should.equal(2);
    });

    describe('persistAuthenticatedUserToRedisMd()', function(){
      before(function(){
        this.utils = {
          saveConnectionToRedis: sinon.stub().resolves(true)
        }
        this.persistAuthenticatedUserToRedisMd =  this.authentication.persistAuthenticatedUserToRedis(this.utils);
      });

      beforeEach(function(){
        this.utils.saveConnectionToRedis.reset();
      })
      it('should not persist users that have no logged_in property', function(done){
        const socket  = fixtures.socketNotLoggedInPropPersist;
        const next = function(err){
          should.not.exist(err);
          this.utils.saveConnectionToRedis.should.have.not.been.called
          done();
        }.bind(this);

        this.persistAuthenticatedUserToRedisMd(socket, next)
      });

      it('should not persist users that are not logged_in', function(done){
        const socket  = fixtures.socketNotLoggedInPersist;
        const next = function(err){
          should.not.exist(err);
          this.utils.saveConnectionToRedis.should.have.not.been.called
          done();
        }.bind(this);

        this.persistAuthenticatedUserToRedisMd(socket, next)
      });

      it('when the user is logged_in, it should call `saveConnectionToRedis()`', function(done){
        const socket  = fixtures.socketLoggedInPersist;
        const next = function(err){
          should.not.exist(err);
          this.utils.saveConnectionToRedis.should.have.been.calledWith(socket.request.user.id, socket);
          done();
        }.bind(this);

        this.persistAuthenticatedUserToRedisMd(socket, next)
      });

      it('it should forward `saveConnectionToRedis()` errors to `next`', function(done){
        const socket  = fixtures.socketLoggedInPersist;
        this.utils.saveConnectionToRedis.rejects(new Error('foo'));
        const next = function(err){
          should.exist(err);
          this.utils.saveConnectionToRedis.should.have.been.calledWith(socket.request.user.id, socket);
          done();
        }.bind(this);

        this.persistAuthenticatedUserToRedisMd(socket, next)
      });
    });
  });
});
