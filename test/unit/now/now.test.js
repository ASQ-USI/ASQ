'use strict';

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const should = chai.should();
const SandboxedModule = require('sandboxed-module');
const Promise = require('bluebird');
const modulePath = '../../../lib/now/now';


describe('now.js', function() {
	before(function(){
		try {
			const uploadDir = this.uploadDir = 'path/to/upload/dir';
			const presentationHtml = this.presentationHtml = '<html></html>'
			const getCurrentPresentation = function(){
				return this.presentation;
			}.bind(this);
			const presentation = this.presentation = {
				_id: 'testid',
				path: '/test/path'
			};
			this.SlideshowModel =  {}
	    //mock db
	    this.db = {model: sinon.stub()};
	    this.db.model
	    .withArgs('Slideshow').returns(this.SlideshowModel)
	    this.now = SandboxedModule.require(modulePath, {
	    	requires: {

	    		// lodash is required by cheerio in ../../../lib/now/now
	    		// the test will fail if we do not require it beforehand
	    		'lodash': require('lodash'),

	    		'fs-extra': this.fs = {
	    			readFile : sinon.stub().callsArgWith(1, ''),
	    			writeFile : sinon.stub().callsArgWith(2, '', ''),
	    			copy : sinon.stub().callsArgWith(2, null, ''),
	    			remove: sinon.stub().callsArgWith(1, null, '')
	    		},

	    		'../upload/liveApp' : this.liveApp = {
	    			addLiveAppFiles: sinon.stub().returns(Promise.resolve(uploadDir))

	    		},

	    		'../upload/upload' : this.upload = {
	    			findAndProcessMainFile: sinon.stub().returns(Promise.resolve(true))
	    		},

	    		'../presentation/presentationCreate' : this.presentationCreate = {},
	    		'../utils/fs' : this.fsUtils = {},
	    	},

	    	globals : {
	    		db : this.db
	    	}
	    });

	  } catch(err){
	  	console.log(err.stack)
	  }
	});


	describe('createPresentationFromSingleExerciseHtml', function() {
		before(function(){
			this.owner_id = 'owner-id-123';
			this.name = 'Now quiz name';

			//markup for a now quiz
			this.markup =
			`<asq-exercise uid="0123456789abcdef12345678">
			<style>
			.multiChoiceOption{
				display: block;
				padding: 5px;
				margin: 5px 0;
			}
			</style>
			<asq-multi-choice-q uid="0123456789abcdef12345678" id='multiQuestion'
			value='[{"uid":"","name":"just a test 1","value":true},{"uid":"","name":"just a test 2","value":false}]'>
			<asq-stem><p>test</p></asq-stem>
			<asq-option name="just a test 1" class="multiChoiceOption">just a test 1</asq-option>
			<asq-option name="just a test 2" class="multiChoiceOption">just a test 2</asq-option>
			<asq-solution hidden>[{"uid":"","name":"just a test 1","value":true},{"uid":"","name":"just a test 2","value":false}]</asq-solution>
			</asq-multi-choice-q>
			</asq-exercise>
			`

			const pid = this.presentationId = 'presentation-id-123' ;
			this.presentationCreate.createBlankSlideshow = sinon.stub().returns(Promise.resolve(this.presentation));

			//stubbing internal functions
			sinon.stub(this.now, "addNowBoilerplateFiles", function(){
        return Promise.resolve(null);
      });

      sinon.stub(this.now, "injectExerciseMarkup", function(){
        return Promise.resolve(null);
      });

		});

		beforeEach(function(done){
			this.presentationCreate.createBlankSlideshow.reset();
			this.now.addNowBoilerplateFiles.reset();
			this.now.injectExerciseMarkup.reset();
			this.liveApp.addLiveAppFiles.reset();
			this.upload.findAndProcessMainFile.reset();

			this.now.createPresentationFromSingleExerciseHtml(this.owner_id, this.name, this.markup)
				.then(function(){
					done()
				}.bind(this)).catch(function(err){
          done(err);
        });
		})

		after(function(){
			this.now.addNowBoilerplateFiles.restore();
			this.now.injectExerciseMarkup.restore();
		})

		it('should create a presentation owned by the owner_id', function() {
			this.presentationCreate.createBlankSlideshow
				.calledWith(this.owner_id, this.name, 'reveal.js')
				.should.equal(true);
		});

		it('should add now boilerplate files', function() {
			this.now.addNowBoilerplateFiles
				.calledWith(this.presentation)
				.should.equal(true);
		});

		it('should inject now markup', function() {
			this.now.injectExerciseMarkup
			.calledWith(this.markup, this.presentation.path)
			.should.equal(true);
		});

		it('should inject the liveApp files', function() {
			this.liveApp.addLiveAppFiles.calledWith(this.presentation.path).should.equal(true);
		});

		it('should find and process the main file', function() {
			this.upload.findAndProcessMainFile.calledWith(this.presentation._id).should.equal(true);
		});

		it('should return the slideshow id', function(done) {
			this.now.createPresentationFromSingleExerciseHtml(this.owner_id, this.name, 'reveal.js')
			.then(function(res) {
				res.should.equal(this.presentation._id)
				done();
			}.bind(this))
			.catch(function(err) {
				done(err);
			});
		});
	});
});