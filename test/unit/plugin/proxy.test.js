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

    this.defaultPresentationSettings = {
      "exercise": [
        { key: 'maxNumSubmissions',
          value: 1,
          kind: 'number',
          level: 'exercise' 
        },
        { key: 'assessment',
          value: 'none',
          kind: 'select',
          params: { options: [Object] },
          level: 'exercise' 
        },
        { key: 'confidence',
          value: false,
          kind: 'boolean',
          level: 'exercise' 
        } 
      ]
    }

    this.Proxy = SandboxedModule.require(modulePath, {
      requires: {
        "lodash": _ ,
        "../hooks/hooks" : this.hooks,
        "./registry" : this.registry,
        "./pubsub" : this.pubsub,
        "../settings/defaultPresentationSettings.js" : this.defaultPresentationSettings
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

   describe("prototype.api.settings.getDefaultSettings", function(){
    it("should return a new instance of settings everty time", function(){
      var proxy = new this.Proxy(this.pluginName);
      // overwriting a value shouldn't matter when we get the defaultSettigns
      // cause we clone every time
      proxy.api.settings.defaultSettings['exercise'][0].value.should.equal(1);
      proxy.api.settings.defaultSettings['exercise'][0].value = 9999;
      proxy.api.settings.defaultSettings['exercise'][0].value.should.equal(1);

      proxy.api.settings.defaultSettings['exercise'][2].value.should.equal(false);
      proxy.api.settings.defaultSettings['exercise'][2].value = true;
      proxy.api.settings.defaultSettings['exercise'][2].value.should.equal(false);
    })
  });

  describe("prototype.socket()", function(){
    it.skip("should test socket")
  });
  describe("prototype.db()", function(){
    it.skip("should test db")
  });
  
});
