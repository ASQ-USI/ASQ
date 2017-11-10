const chai = require('chai');
const Promise = require('bluebird');
const SandboxedModule = require('sandboxed-module');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const should = chai.should();
const expect = chai.expect;
chai.use(sinonChai);
require('sinon-as-promised')(Promise);

const modulePath = '../../../lib/live/live.js';


context('lib/live.js', function() {
  before(function(){
  	const execObject = this.execObject = {
      exec: function(){
        return Promise.resolve(undefined);
      },
    };

    const save = function save() {
    	return Promise.resolve({});
    }
    const SlideshowModel = this.SlideshowModel = {
      findOne: sinon.stub().returns(execObject)
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
    	return data 
    };

    const Exercise = this.Exercise = function Exercise(data) { 
    	data.save = save;
    	return data 
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
	  			presenter: '123',
	  			slides: '234',
	  			flow: 'mockedFlow',
	  			authLevel: 'mockedAuthLevel',
	  			data,
	  		};
  	});

  	describe('Given a userId and a presentation', function () {
	  	it('returns a new created session correctly', function() {
	  		const newSession = this.live.createNewLiveSession('123', {'_id': '234'});

	  		expect(session.presenter).to.deep.equal(newSession.presenter);
	  		expect(session.slides).to.deep.equal(newSession.slides);

	  		expect(session.flow).to.not.deep.equal(newSession.flow);
	  		expect(session.authLevel).to.not.deep.equal(newSession.authLevel);
	  		expect('ctrl').to.deep.equal(newSession.flow);
	  		expect('public').to.deep.equal(newSession.authLevel);

	  		expect(session.data).to.deep.equal(newSession.data);
	  	});

  	});

  	describe('Given a userId and a presentation with slides tree steps', function () {
	  	it('returns a new created session correctly, with the correct active slide', function() {
	  		const userId = '123';
	  		const presentation = {
	  			'_id': '234',
	  			slidesTree: {
	  				steps: ['0'],
	  			},
	  		};
	  		const newSession = this.live.createNewLiveSession(userId, presentation);

	  		expect(session.presenter).to.deep.equal(newSession.presenter);
	  		expect(session.slides).to.deep.equal(newSession.slides);

	  		expect(session.flow).to.not.deep.equal(newSession.flow);
	  		expect(session.authLevel).to.not.deep.equal(newSession.authLevel);
	  		expect('ctrl').to.deep.equal(newSession.flow);
	  		expect('public').to.deep.equal(newSession.authLevel);

	  		expect(session.data).to.deep.equal(newSession.data);
	  		expect(presentation.slidesTree.steps[0]).to.deep.equal(newSession.activeSlide);
	  	});

  	});

  	describe('Given a userId, a presentation with slides tree steps, a flow and an authentication level', function () {
	  	it('returns a new created session correctly, with the correct flow and authentication level', function() {
	  		const userId = '123';
	  		const presentation = {
	  			'_id': '234',
	  			slidesTree: {
	  				steps: ['0'],
	  			},
	  		};
	  		const flow = 'ghost';
	  		const authLevel = 'authLevel';
	  		const newSession = this.live.createNewLiveSession(userId, presentation, flow, authLevel);

	  		expect(session.presenter).to.deep.equal(newSession.presenter);
	  		expect(session.slides).to.deep.equal(newSession.slides);

	  		expect(flow).to.deep.equal(newSession.flow);
	  		expect(authLevel).to.deep.equal(newSession.authLevel);

	  		expect(session.data).to.deep.equal(newSession.data);
	  		expect(presentation.slidesTree.steps[0]).to.deep.equal(newSession.activeSlide);
	  	});
  	});
  });


  context('createImplicitQuestion',function() {
  	describe('Given an owner identifier, and a session identifier', function () {
	  	it('returns the correct implicit question with the correct userId and sessionId', function() {
	  		const ownerId = '123';
	  		const sessionId = '456';
	  		const implicitQuestion = this.live.createImplicitQuestion(ownerId, sessionId);
	  		expect(implicitQuestion.author).to.be.deep.equal(ownerId);
	  	});
  	});
  });


  context('createViewerQuestionExercise',function() {
  	describe('Given an implicit question identifier', function () {
	  	it('should return the correct implicit question with the correct userId and sessionId', function() {
	  		const implicitQuestionId = '123';
	  		const viewerQuestionExercise = this.live.createViewerQuestionExercise(implicitQuestionId);
	  		expect(viewerQuestionExercise.questions).to.be.deep.equal([implicitQuestionId]);
	  	});
  	});
  });

  context('createLivePresentation',function() {
  	describe('Given the user is not defined', function () {
	  	it('throws an error that no user was specified', function(done) {
				this.live.createLivePresentation(undefined, {"_id": '123'})
		      .then(function(res) {
		        expect(res).to.be.equal(undefined);
		        done();
		      }.bind(this))
		      .catch(function(err) {
		      	expect(err).to.not.be.null;
		      	expect(err).to.not.be.undefined;
						done()
				});
	  	});
  	});

  	describe('Given the user is null', function () {
	  	it('throws an error that no user was specified', function(done) {
				this.live.createLivePresentation(null, {"_id": '123'})
		      .then(function(res) {
		        expect(res).to.be.equal(undefined);
		        done();
		      }.bind(this))
		      .catch(function(err) {
		      	expect(err).to.not.be.null;
		      	expect(err).to.not.be.undefined;
		      	expect(err.message).to.be.equal('No user was given for creating a live presentation');
						done()
				});
	  	});
  	});

		describe('Given the user without identifier', function () {
	  	it('throws an error that no user was specified', function(done) {
				this.live.createLivePresentation({}, {"_id": '123'})
		      .then(function(res) {
		        expect(res).to.be.equal(undefined);
		        done();
		      }.bind(this))
		      .catch(function(err) {
		      	expect(err).to.not.be.null;
		      	expect(err).to.not.be.undefined;
		      	expect(err.message).to.be.equal('No user was given for creating a live presentation');
						done()
				});
	  	});
  	});

		describe('Given a user and an invalid presentation', function () {
			it('throws an error that the presentation is not found', function(done) {
				this.live.createLivePresentation({"_id": '456'}, {})
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

		describe('Given a valid user and a valid presentation', function () {
			before(function() {
				const execObject = {
					exec: function(){
						return Promise.resolve({
							"_id": "dummyId",
							save: function () {
								return Promise.resolve({});
							},
						});
					},
				};
				this.SlideshowModel.findOne = sinon.stub().returns(execObject);

				this.lib.utils.presentation.generateWhitelist.public.returns(Promise.resolve(undefined));
				this.lib.utils.presentation.generateWhitelist.public.reset();
			});
			it('does not throw an error', function(done) {
				this.live.createLivePresentation({"_id": '456'}, {})
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