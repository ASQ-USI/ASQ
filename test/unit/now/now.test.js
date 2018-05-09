'use strict';

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const should = chai.should();
const SandboxedModule = require('sandboxed-module');
const Promise = require('bluebird');
const modulePath = '../../../lib/now/now';


describe('upload.js', function() {
	before(function(){
		try {
			const uploadDir = this.uploadDir = 'path/to/upload/dir';
			const presentationHtml = this.presentationHtml = '<html></html>'
			const getCurrentPresentation = function(){
				return this.presentation;
			}.bind(this);
			this.SlideshowModel =  {
				findById: sinon.stub().returns({
					exec: function(){
						return Promise.resolve(presentation);
					}
				})
			}
    //mock db
    this.db = {model: sinon.stub()};
    this.fileType = sinon.stub();
    this.db.model
    .withArgs('Slideshow').returns(this.SlideshowModel)
    this.now = SandboxedModule.require(modulePath, {
    	requires: {
	        // careful here this is promisified in upload.js. This means
	        // that parse.js will have a call on `readFileAsync` instead of `readFile`
	        // same writeFile
	        'read-chunk': function(path, start, finish, cb){ cb(null, 'chunk')},
	        'fs': this.fs = {
	        	readFile : sinon.stub().callsArgWith(2, null, presentationHtml),
	        	writeFile : sinon.stub().callsArgWith(2, null, ''),
	        	unlink : sinon.stub().callsArgWith(1, null, ''),
	        	rename : sinon.stub().callsArg(2, null, '')
	        },
	        'logger-asq' : require('logger-asq'),
	        './liveApp' : this.liveApp = {
	        	addLiveAppFiles: sinon.stub().returns(Promise.resolve(true))
	        },
	        './liveApp' : this.liveApp = {
	        	addLiveAppFiles: sinon.stub().returns(Promise.resolve(uploadDir))

	        },
	        '../presentation/presentationCreate' : this.presentationCreate = {},
	        '../utils/fs' : this.fsUtils = {},
	        '../../../lib/upload/now/now' : this.upload = {}
	      },
	      globals : {
	      	db : this.db
	      }
	    });
  } catch(err){
  	console.log(err.stack)
  }
});
});

describe('createPresentationFromSingleExerciseHtml', function() {
	it('should create a presentation using an ASQ exercise', function() {
		before(function(){
			this.owner_id = 'owner-id-123';
			this.name = 'Presentation name';
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
			</asq-exercise>`
			const pid = this.presentationId = 'presentation-id-123' ;
			this.presentationCreate.createBlankSlideshow = sinon.stub().returns(Promise.resolve(this.presentation));
			this.now.createPresentationFromSingleExerciseHtml(this.owner_id, this.name, this.markup)
			.then(function(res){
				res.should.equal(this.presentationId);
				done();
			}.bind(this))
			.catch(function(err){
				done(err);
			});
		})
	});
});