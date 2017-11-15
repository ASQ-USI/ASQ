const chai = require('chai');
const Promise = require('bluebird');
const SandboxedModule = require('sandboxed-module');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const expect = chai.expect;
const should = chai.should();
chai.use(sinonChai);
require('sinon-as-promised')(Promise);

const modulePath = '../../../lib/live/live.js';


function createExecObject(returnValue){
  return {
    exec: function(){
      return Promise.resolve(returnValue);
    }
  }
}

context('lib/live.js', function() {
  before(function(){

    const save = function save() {
    	return Promise.resolve({});
    };

    const SlideshowModel = this.SlideshowModel = {
      findOne: sinon.stub()
    };

    const UserModel = this.UserModel = {
      findById: sinon.stub()
    };

    const Session = this.Session = function Session() {
      this._id = 'testSessionId';
    };

    this.Session.schema = {
    	path: function (name) {
      	switch (name) {
      		case 'flow':
      			return {
      				enumValues: ['ctrl', 'ghost', 'folo'],
      			};
      		case 'authLevel':
      			return {
      				enumValues: ['public', 'authLevel'],
      			}
      	}
      }
    };

    this.Session.prototype.markModified = function (property) { return 'mock return'; };
    this.Session.prototype.save = function save() {
      return Promise.resolve(this);
    };

    const Question = this.Question = function Question(data) {
      data._id = 'testQuestionId';
    	data.save = save;
    	return data;
    };

    const Exercise = this.Exercise = function Exercise(data) { 
      data._id = 'testQuestionId';
    	data.save = save;
    	return data;
    };

    this.resetStubs = function(){
      this.SlideshowModel.findOne.reset();
    };

    this.db = {
      model : function(name){
        switch(name){
          case 'Slideshow':
            return SlideshowModel;
          case 'Session':
            return Session;
          case 'Question':
            return Question;
          case 'Exercise':
            return Exercise;
          case 'User':
            return UserModel;
          default:
            return undefined;
        }
      }
    };

    this.lib = {
    	utils: {
    		presentation: {
    			generateWhitelist: {
    				public : sinon.stub()
    			}
    		},
    	},
    };

    this.live = SandboxedModule.require(modulePath, {
      globals : {
        db : this.db,
      },
      requires: {
      	'../index.js': this.lib,
      },
    });

  });

  context('createLiveSession',function() {
  	let session;
  	beforeEach(function(){
	  		const data = {
			    activeViewerQuestion: null,
			    questions: [],
			    studentQuestionsEnabled: false,
			  };
	  		session = new this.Session(); 
	  		session.presenter = 'testPresenterId';
	  		session.slides = 'testPresentationId';
	  		session.data = data;
        session.authLevel = 'public';
        session.flow = 'ctrl';

  	});

  	describe('Given a ownerId and a presentation', function () {
	  	it('returns a newly created session correctly', function() {
	  		const newSession = this.live.createLiveSession('testPresenterId', {'_id': 'testPresentationId'});
        expect(newSession).to.deep.equal(session);
	  	});

  	});

  	describe('Given a ownerId and a presentation with slides tree steps', function () {
	  	it('returns a newly created session correctly, with the correct active slide', function() {
	  		const ownerId = 'testPresenterId';
	  		const presentation = {
	  			'_id': 'testPresentationId',
	  			slidesTree: {
	  				steps: ['0'],
	  			},
	  		};
	  		const newSession = this.live.createLiveSession(ownerId, presentation);
        session.activeSlide = presentation.slidesTree.steps[0];
        expect(newSession).to.deep.equal(session);
	  	});

  	});

  	describe('Given a ownerId, a presentation with slides tree steps, a flow and an authentication level', function () {
	  	it('returns a newly created session correctly, with the correct flow and authentication level', function() {
	  		const ownerId = 'testPresenterId';
	  		const presentation = {
	  			'_id': 'testPresentationId',
	  			slidesTree: {
	  				steps: ['0'],
	  			},
	  		};
	  		const flow = 'ghost';
	  		const authLevel = 'authLevel';
        session.flow = flow;
        session.authLevel = authLevel;
        session.activeSlide = presentation.slidesTree.steps[0];

	  		const newSession = this.live.createLiveSession(ownerId, presentation, flow, authLevel);
        expect(newSession).to.deep.equal(session);
	  	});
  	});
  });


  context('createImplicitAudienceQuestion',function() {
  	describe('Given an owner identifier, and a session identifier', function () {
	  	it('returns the correct implicit question with the correct ownerId and sessionId', function() {
	  		const ownerId = 'testOwnerId';
	  		const sessionId = 'testSessionId';
	  		const implicitQuestion = this.live.createImplicitAudienceQuestion(ownerId, sessionId);
	  		expect(implicitQuestion.author).to.be.deep.equal(ownerId);
	  	});
  	});
  });


  context('createViewerQuestionExercise',function() {
  	describe('Given an implicit question identifier', function () {
	  	it('should return the correct implicit question with the correct ownerId and sessionId', function() {
	  		const implicitQuestionId = 'testQuestionId';
	  		const viewerQuestionExercise = this.live.createViewerQuestionExercise(implicitQuestionId);
	  		expect(viewerQuestionExercise.questions).to.be.deep.equal([implicitQuestionId]);
	  	});
  	});
  });

  context('createLivePresentationSession',function() {
  	describe('Given the owner is not defined', function () {
      before(function(){
        this.UserModel.findById.returns(createExecObject(undefined));
      });

	  	it('throws an error that no owner was specified', function(done) {

				this.live.createLivePresentationSession(undefined, 'testPresentationId')
		      .then(function(res) {
		        expect(res).to.be.equal(undefined);
		        done();
		      }.bind(this))
		      .catch((err) => {
            this.UserModel.findById.calledWith(undefined).should.equal(true);
		      	expect(err).to.not.be.null;
		      	expect(err).to.not.be.undefined;
            expect(err.message).to.be.equal('Could not find owner with id: undefined');
						done()
				});
	  	});
  	});

  	describe('Given the owner is null', function () {
      before(function(){
        this.UserModel.findById.returns(createExecObject(null));
      });

	  	it('throws an error that no owner was specified', function(done) {

				this.live.createLivePresentationSession(null, 'testPresentationId')
		      .then(function(res) {
		        expect(res).to.be.equal(undefined);
		        done();
		      }.bind(this))
		      .catch((err) => {
            this.UserModel.findById.calledWith(null).should.equal(true);
		      	expect(err).to.not.be.null;
		      	expect(err).to.not.be.undefined;
		      	expect(err.message).to.be.equal('Could not find owner with id: null');
						done()
				});
	  	});
  	});


		describe('Given a owner and an invalid presentation', function () {
      before(function(){
        const testOwner = {
          _id: 'testOwnerId'
        }
        this.UserModel.findById.returns(createExecObject(testOwner));
        this.SlideshowModel.findOne.returns(createExecObject(undefined));
      });
			it('throws an error that the presentation is not found', function(done) {
				this.live.createLivePresentationSession('testOwnerId', {})
					.then(function(res) {
						expect(res).to.be.equal(undefined);
						done();
					}.bind(this))
					.catch(function(err) {
						expect(err).to.not.be.null;
						expect(err).to.not.be.undefined;
						expect(err.message).to.be.equal('No presentation with this id');
						done()
				});
			});
		});

		describe('Given a valid owner and a valid presentation', function () {
      let testPresentation;
      let testOwner;
      let testSession;
			before(function() {
        testOwner = {
          _id: 'testOwnerId'
        }
        this.UserModel.findById.returns(createExecObject(testOwner));

        testPresentation = {
          _id: 'testId',
          save: function () {
            return Promise.resolve({});
          },
        };

        testSession = new this.Session();
        testSession = new this.Session(); 
        testSession.presenter = testOwner._id;
        testSession.slides = testPresentation._id;
        testSession.data = {
          activeViewerQuestion: null,
          questions: [],
          studentQuestionsEnabled: false,
        };
        testSession.authLevel = 'public';
        testSession.flow = 'ctrl';

				this.SlideshowModel.findOne.returns(createExecObject(testPresentation));

				this.lib.utils.presentation.generateWhitelist.public.returns(Promise.resolve(undefined));

        sinon.spy(this.live, 'createLiveSession');
        sinon.spy(this.live, 'createImplicitAudienceQuestion');
        sinon.spy(this.live, 'createViewerQuestionExercise');
			});

      beforeEach(function(){
        this.live.createLiveSession.reset();
        this.live.createImplicitAudienceQuestion.reset();
        this.live.createViewerQuestionExercise.reset();
        this.lib.utils.presentation.generateWhitelist.public.reset();
      })

      after(function () {
        this.live.createLiveSession.restore();
        this.live.createImplicitAudienceQuestion.restore();
        this.live.createViewerQuestionExercise.restore();
      });

      it('does call createLiveSession', function(done) {
        this.live.createLivePresentationSession(testOwner._id, testPresentation._id)
          .then(function(res) {
            expect(res).to.not.be.null;
            expect(res).to.not.be.undefined;
            this.live.createLiveSession.calledOnce.should.equal(true);
            this.live.createLiveSession.calledWith(testOwner._id, testPresentation, undefined, undefined).should.equal(true);
            done();
          }.bind(this))
          .catch(function(err) {
            expect(err).to.be.null;
            expect(err).to.be.undefined;
            done(err)
        });
      });

      it('does call createImplicitAudienceQuestion', function(done) {
        this.live.createLivePresentationSession(testOwner._id, testPresentation._id)
          .then(function(res) {
            expect(res).to.not.be.null;
            expect(res).to.not.be.undefined;
            this.live.createLiveSession.calledOnce.should.equal(true);
            this.live.createLiveSession.calledWith(testOwner._id, testPresentation, undefined, undefined).should.equal(true);
            this.live.createImplicitAudienceQuestion.calledOnce.should.equal(true);
            this.live.createImplicitAudienceQuestion.calledWith(testOwner._id, 'testSessionId').should.equal(true);
            done();
          }.bind(this))
          .catch(function(err) {
            expect(err).to.be.null;
            expect(err).to.be.undefined;
            done(err)
        });
      });

      it('does call createViewerQuestionExercise', function(done) {
        this.live.createLivePresentationSession(testOwner._id, testPresentation._id)
          .then(function(res) {
            expect(res).to.not.be.null;
            expect(res).to.not.be.undefined;
            this.live.createLiveSession.calledOnce.should.equal(true);
            this.live.createLiveSession.calledWith(testOwner._id, testPresentation, undefined, undefined).should.equal(true);

            this.live.createImplicitAudienceQuestion.calledOnce.should.equal(true);
            this.live.createImplicitAudienceQuestion.calledWith(testOwner._id, 'testSessionId').should.equal(true);

            this.live.createViewerQuestionExercise.calledOnce.should.equal(true);
            this.live.createViewerQuestionExercise.calledWith('testQuestionId').should.equal(true);
            done();
          }.bind(this))
          .catch(function(err) {
            expect(err).to.be.null;
            expect(err).to.be.undefined;
            done(err)
        });
      });

      it('does call generateWhitelist', function(done) {
        this.live.createLivePresentationSession(testOwner._id, testPresentation._id)
          .then(function(res) {
            expect(res).to.not.be.null;
            expect(res).to.not.be.undefined;
            this.live.createLiveSession.calledOnce.should.equal(true);
            this.live.createLiveSession.calledWith(testOwner._id, testPresentation, undefined, undefined).should.equal(true);

            this.live.createImplicitAudienceQuestion.calledOnce.should.equal(true);
            this.live.createImplicitAudienceQuestion.calledWith(testOwner._id, 'testSessionId').should.equal(true);

            this.live.createViewerQuestionExercise.calledOnce.should.equal(true);
            this.live.createViewerQuestionExercise.calledWith('testQuestionId').should.equal(true);

            this.lib.utils.presentation.generateWhitelist.public.calledWith('testSessionId', testOwner).should.equal(true);
            done();
          }.bind(this))
          .catch(function(err) {
            expect(err).to.be.null;
            expect(err).to.be.undefined;
            done(err)
        });
      });

      it('does not throw an error', function(done) {
        this.live.createLivePresentationSession(testOwner._id, testPresentation._id)
          .then(function(res) {
            expect(res).to.not.be.null;
            expect(res).to.not.be.undefined;
            this.live.createLiveSession.calledOnce.should.equal(true);
            this.live.createLiveSession.calledWith(testOwner._id, testPresentation, undefined, undefined).should.equal(true);

            this.live.createImplicitAudienceQuestion.calledOnce.should.equal(true);
            this.live.createImplicitAudienceQuestion.calledWith(testOwner._id, 'testSessionId').should.equal(true);

            this.live.createViewerQuestionExercise.calledOnce.should.equal(true);
            this.live.createViewerQuestionExercise.calledWith('testQuestionId').should.equal(true);

            this.lib.utils.presentation.generateWhitelist.public.calledWith('testSessionId', testOwner).should.equal(true);
            done();
          }.bind(this))
          .catch(function(err) {
            expect(err).to.be.null;
            expect(err).to.be.undefined;
            done()
        });
      });

      it('does not throw an error and returns the newly created session correctly', function(done) {
        this.live.createLivePresentationSession(testOwner._id, testPresentation._id)
          .then(function(res) {
            expect(res).to.not.be.null;
            expect(res).to.not.be.undefined;
            this.live.createLiveSession.calledOnce.should.equal(true);
            this.live.createLiveSession.calledWith(testOwner._id, testPresentation, undefined, undefined).should.equal(true);

            this.live.createImplicitAudienceQuestion.calledOnce.should.equal(true);
            this.live.createImplicitAudienceQuestion.calledWith(testOwner._id, 'testSessionId').should.equal(true);

            this.live.createViewerQuestionExercise.calledOnce.should.equal(true);
            this.live.createViewerQuestionExercise.calledWith('testQuestionId').should.equal(true);

            this.lib.utils.presentation.generateWhitelist.public.calledWith('testSessionId', testOwner).should.equal(true);
            expect(res).to.deep.equal(testSession);
            done();
          }.bind(this))
          .catch(function(err) {
            expect(err).to.be.null;
            expect(err).to.be.undefined;
            done()
        });
      });
		});

  });

});