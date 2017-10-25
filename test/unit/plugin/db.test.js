"use strict";

var chai = require('chai');
var sinon = require("sinon");
var should = chai.should();
var expect = chai.expect;
var SandboxedModule = require('sandboxed-module');
var Promise = require('bluebird');
var modulePath = "../../../lib/plugin/db";
var _ = require("lodash");

describe("db.js", function(){
 before(function(){
   var name = this.name = "asq-canvas"
   var session_id = this.session_id = "83928sadjk";

   this.pluginCustomData = {
       "_id": "plugin-custom-data-id-123",
       "pluginName": name,
       "session": session_id,
       "daata": { 'exampleData': 'hi'},
       save: function(){ return Promise.resolve(this);}
     }

   //mock db
   var db = {model: function(){}};
   var createStub = this.createStub = sinon.stub().returns(Promise.resolve(this.presentation));
   var exec = { exec: sinon.stub().returns(Promise.resolve(true))}
   var findByIdAndUpdateStub = this.findByIdAndUpdateStub = sinon.stub().returns(exec);

   sinon.stub(db, "model")
   .withArgs("pluginCustomData").returns({
     "create" : createStub,
   })

  });


  describe("savePluginSessionData", function(){
    beforeEach(function(){
      // do before every test
    });

    it.skip("should save new pluginSessionData if it doesn't already exist in the db", function(){
      // test
    });

    it.skip("should overwrite existing pluginSessionData when new data is provided", function(){
      // test
    });
  });

  describe("getPluginSessionData", function(){
    beforeEach(function(){
      // do before each test
    });

    it.skip("return plugin session data if it exists one for the given plugin name and session id", function(){
      // test
    });

    it.skip("return null if no plugin session data for the given plugin name and session id exists", function(){
      // test
    });
  });

});
