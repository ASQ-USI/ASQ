'use strict';

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const should = chai.should();
const SandboxedModule = require('sandboxed-module');
const Promise = require('bluebird');
const modulePath = '../../../lib/upload/liveApp';

describe('liveApp.js',function(){

	before(function(){
		try{
			this.liveApp = SandboxedModule.require(modulePath)
		}catch(err){
			console.log(err.stack)
		}


	});
	describe('addLiveAppFiles',function(){
		before(function(){
			sinon.stub(this.liveApp, 'addLiveAppFiles');

		})
	    beforeEach(function() {
      		this.destination = "/path/to/zip/destination";
      		this.liveApp.addLiveAppFiles(this.destination);
    	});
    	after(function(){
    		this.liveApp.addLiveAppFiles.restore();

    	});
    	it('should have called addLiveAppFiles once',function(){
    		this.liveApp.addLiveAppFiles.calledOnce.should.equal(true)

    	})
    	it('should have been called with the presentation directory',function(){
    		this.liveApp.addLiveAppFiles.calledWith(this.destination).should.equal(true)
    	});
	})
});