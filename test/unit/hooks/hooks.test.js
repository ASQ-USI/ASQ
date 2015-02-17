"use strict";

var chai = require('chai');
var sinon = require("sinon");
var should = chai.should();
var expect = chai.expect;
var SandboxedModule = require('sandboxed-module');
var Promise = require('bluebird');
var modulePath = "../../../lib/hooks/hooks";
var _ = require("lodash");

describe("hooks.js", function(){
  before(function(){

    this.asq = {
      registerHook: {}
    }

    this.hooks = SandboxedModule.require(modulePath, {
      requires: {
        "lodash": _ 
      }
    });
  });

  describe("registerHook()", function(){

    beforeEach(function(){
      this.hooks.hookCbs = Object.create(null);
    });

    it.skip("should log attempts to register a hook with no function", function(){}

    it("should register a function", function(){
      this.hooks.registerHook("hookName", function(){})
      should.exist(this.hooks.hookCbs["hookName"]);
      expect(this.hooks.hookCbs["hookName"]).to.be.an('array');
    });

    it("should register with the correct order", function(){
      var f0 = function (){};
      var f1 = function (){};
      var f2 = function (){};
      
      this.hooks.registerHook("hookName", f0);
      this.hooks.registerHook("hookName", f1);
      this.hooks.registerHook("hookName", f2);

      should.exist(this.hooks.hookCbs["hookName"]);
      expect(this.hooks.hookCbs["hookName"].indexOf(f0)).to.equal(0);
      expect(this.hooks.hookCbs["hookName"].indexOf(f1)).to.equal(1);
      expect(this.hooks.hookCbs["hookName"].indexOf(f2)).to.equal(2);
    });

    it("should not register a hook when there is no function to register", function(){
      this.hooks.registerHook("hookName")
      should.not.exist(this.hooks.hookCbs["hookName"]);
    });
  });

   describe("deregisterHook()", function(){

    beforeEach(function(){
      this.hooks.hookCbs = Object.create(null);
      this.f0 = function (){};
      this.f1 = function (){};
      this.f2 = function (){};
      this.f3 = function (){};
      
      this.hooks.registerHook("hookName", this.f0);
      this.hooks.registerHook("hookName", this.f1);
      this.hooks.registerHook("hookName", this.f2);
      this.hooks.registerHook("hookName", this.f3);

    });

    it("should deregister the correct function", function(){
      this.hooks.deregisterHook("hookName", this.f2)
      expect(this.hooks.hookCbs["hookName"].length).to.equal(3);
      expect(this.hooks.hookCbs["hookName"].indexOf(this.f2)).to.equal(-1);
    });

    it("should preserve the correct order", function(){
      this.hooks.deregisterHook("hookName", this.f2)
      this.hooks.deregisterHook("hookName", this.f1)
      expect(this.hooks.hookCbs["hookName"].indexOf(this.f3)).to.equal(1);
    });

    it("when there is no function to deregister, it should leave the hooks hash intact", function(){
      this.hooks.deregisterHook("hookName")
      should.exist(this.hooks.hookCbs["hookName"]);
      expect(this.hooks.hookCbs["hookName"].length).to.equal(4);
    });
  });

  // describe("doHook()", function(){
    
  //   beforeEach(function(done){
  //     this.hooks.hookCbs = Object.create(null);
  //     this.f0 = sinon.stub();
  //     this.f1 = sinon.stub();
  //     this.f2 = sinon.stub();
      
  //     this.hooks.registerHook("hookName", this.f0);
  //     this.hooks.registerHook("hookName", this.f1);
  //     this.hooks.registerHook("hookName", this.f2);

  //     this.hooks.doHook("hookName")
  //     .then(function(){
  //       done();
  //     })
  //     .catch(function(err){
  //       done(err);
  //     })
  //   });

  //   it("should call all the registered functions", function(){
  //     this.f0.calledOnce.should.equal(true);
  //     this.f1.calledOnce.should.equal(true);
  //     this.f2.calledOnce.should.equal(true);
  //   });

  //   it("the registered functions should be invoked in the correct order", function(){
  //     this.f0.calledBefore(this.f1).should.equal(true);
  //     this.f1.calledBefore(this.f2).should.equal(true);
  //   });
  // });

  describe("doHook()", function(){
    
    beforeEach(function(done){
      this.hooks.hookCbs = Object.create(null);

      this.f0 = function(){};
      this.f1 = function(){};
      this.f2 = function(){};

      this.cb0 = sinon.stub();
      this.cb1 = sinon.stub();
      this.cb2 = sinon.stub();
      
      var self = this;

      sinon.stub(this, "f0", function(){
        return Promise.delay(100).then(function(){
          return self.cb0();
        });
      });
      sinon.stub(this, "f1", function(){
        return Promise.delay(40).then(function(){
          return self.cb1();
        });
      });
      sinon.stub(this, "f2", function(){
        return Promise.delay(70).then(function(){
          return self.cb2();
        });
      });
      
      this.hooks.registerHook("hookName", this.f0);
      this.hooks.registerHook("hookName", this.f1);
      this.hooks.registerHook("hookName", this.f2);

      this.hooks.doHook("hookName")
      .then(function(){
        done();
      })
      .catch(function(err){
        done(err);
      })
    });

    it("should call all the registered functions", function(){
      this.f0.calledOnce.should.equal(true);
      this.f1.calledOnce.should.equal(true);
      this.f2.calledOnce.should.equal(true);
    });

    it("the registered functions should be invoked in the correct order", function(){
      this.f0.calledBefore(this.f1).should.equal(true);
      this.f1.calledBefore(this.f2).should.equal(true);
    });

    it("the callbacks of the function should be invoked in the correct order", function(){
      this.cb0.calledBefore(this.cb1).should.equal(true);
      this.cb1.calledBefore(this.cb2).should.equal(true);
    });

    it("should resolve if there are no hooks registered with the specified name", function(done){
      this.hooks.doHook("nameWithoutHooks")
      .then(function(){
        done();
      })
      .catch(function(err){
        done(err);
      })
    })
  });
  
});





