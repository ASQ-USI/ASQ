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

    const Session = this.Session = function Session() {};

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
    this.Session.prototype.save = save;

    const Question = this.Question = function Question(data) { 
    	data.save = save;
    	return data;
    };

    const Exercise = this.Exercise = function Exercise(data) { 
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

  context('createNewLiveSession',function() {
  	let session;
  	beforeEach(function(){
	  		const data = {
			    activeViewerQuestion: null,
			    questions: [],
			    studentQuestionsEnabled: false,
			  };
	  		session = {
	  			presenter: 'testPresenterId',
	  			slides: 'testPresentationId',
	  			data,
	  		};
  	});

  	describe('Given a ownerId and a presentation', function () {
	  	it('returns a newly created session correctly', function() {
	  		const newSession = this.live.createNewLiveSession('testPresenterId', {'_id': 'testPresentationId'});

	  		expect(newSession.presenter).to.deep.equal(session.presenter);
	  		expect(newSession.slides).to.deep.equal(session.slides);

	  		expect(newSession.flow).to.deep.equal('ctrl');
	  		expect(newSession.authLevel).to.deep.equal('public');

	  		expect(newSession.data).to.deep.equal(session.data);
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
	  		const newSession = this.live.createNewLiveSession(ownerId, presentation);

	  		expect(newSession.presenter).to.deep.equal(session.presenter);
	  		expect(newSession.slides).to.deep.equal(session.slides);

	  		expect(newSession.flow).to.deep.equal('ctrl');
	  		expect(newSession.authLevel).to.deep.equal('public');

	  		expect(newSession.data).to.deep.equal(session.data);
	  		expect(newSession.activeSlide).to.deep.equal(presentation.slidesTree.steps[0]);
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
	  		const newSession = this.live.createNewLiveSession(ownerId, presentation, flow, authLevel);

	  		expect(newSession.presenter).to.deep.equal(session.presenter);
	  		expect(newSession.slides).to.deep.equal(session.slides);

	  		expect(newSession.flow).to.deep.equal(flow);
	  		expect(newSession.authLevel).to.deep.equal(authLevel);

	  		expect(newSession.data).to.deep.equal(session.data);
	  		expect(newSession.activeSlide).to.deep.equal(presentation.slidesTree.steps[0]);
	  	});
  	});
  });


  context('createImplicitQuestion',function() {
  	describe('Given an owner identifier, and a session identifier', function () {
	  	it('returns the correct implicit question with the correct ownerId and sessionId', function() {
	  		const ownerId = 'testOwnerId';
	  		const sessionId = 'testSessionId';
	  		const implicitQuestion = this.live.createImplicitQuestion(ownerId, sessionId);
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
			before(function() {
        const testOwner = {
          _id: 'testOwnerId'
        }
        this.UserModel.findById.returns(createExecObject(testOwner));

        const testPresentation = {
          _id: 'testId',
          save: function () {
            return Promise.resolve({});
          }
        }
				this.SlideshowModel.findOne.returns(createExecObject(testPresentation));

				this.lib.utils.presentation.generateWhitelist.public.returns(Promise.resolve(undefined));
				this.lib.utils.presentation.generateWhitelist.public.reset();
			});
			it('does not throw an error', function(done) {
				this.live.createLivePresentationSession({'_id': '456'}, {})
					.then(function(res) {
						expect(res).to.not.be.null;
						expect(res).to.not.be.undefined;
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