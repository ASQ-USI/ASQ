"use strict";

var chai = require('chai');
var sinon = require("sinon");
var should = chai.should();
var expect = chai.expect;
var SandboxedModule = require('sandboxed-module');
var modulePath = "../../../lib/plugin/proxy";
var _ = require("lodash");

describe("proxy.js", function(){
 before(function(){
    this.pluginName = 'asq-plugin'

    this.hooks = {
      registerHook : sinon.stub()
    }

    this.registry = {
      addHook : sinon.stub(),
      addEvent : sinon.stub()
    }

    this.pubsub = {
      on : sinon.stub(),
    }

    //mock db
    this.db = {model: function(){}};

    this.Proxy = SandboxedModule.require(modulePath, {
      requires: {
        "lodash": _ ,
        "../hooks/hooks" : this.hooks,
        "./registry" : this.registry,
        "./pubsub" : this.pubsub
      },
      globals : {
        db : this.db
      }
    });
  });


  describe("prototype.registerHook()", function(){
    beforeEach(function(){
      this.hooks.registerHook.reset();
      this.registry.addHook.reset();
      this.fn = function(){};
      
      this.proxy = new this.Proxy(this.pluginName);
      this.proxy.registerHook("hookName", this.fn);
    });

    it("should call registry.addHook ", function(){
      this.registry.addHook
        .calledWithExactly(this.pluginName,"hookName", this.fn)
        .should.equal(true);
    });

    it("should call hooks.registerHook", function(){
      this.hooks.registerHook
        .calledWith("hookName", this.fn).should.equal(true);
    });
  });

  describe("prototype.registerEvent()", function(){
    beforeEach(function(){
      this.pubsub.on.reset();
      this.registry.addEvent.reset();
      this.fn = function(){};

      this.proxy = new this.Proxy(this.pluginName);
      this.proxy.registerEvent("eventName", this.fn);
    });

    it("should call registry.addEvent ", function(){ 
      this.registry.addEvent
        .calledWithExactly(this.pluginName, "eventName", this.fn)
        .should.equal(true);
    });

    it("should call pubsub.on", function(){
      this.pubsub.on.calledWith("eventName", this.fn).should.equal(true);
    });
  });

  describe("prototype.socket()", function(){
    it.skip("should test socket")
  });
  describe("prototype.db()", function(){
    it.skip("should test db")
  });
  
});





