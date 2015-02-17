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

    this.commands = Object.create(null);
    this.commands.goodCommand = sinon.stub();
    this.commands.assessmentComplete = sinon.stub();
    this.commands.noFunction = {};

    this.hooks = {
      registerHook : sinon.stub()
    }

    this.Proxy = SandboxedModule.require(modulePath, {
      requires: {
        "lodash": _ ,
        "./commands" : this.commands,
        "../hooks/hooks" : this.hooks,
      }
    });
  });

  describe("prototype.command()", function(){
    beforeEach(function(){
      this.proxy = new this.Proxy();
      this.commands.goodCommand.reset();
    });

    it("should fail if the argument is empty or null or undefined ", function(){
      expect(this.proxy.command).to.throw(Error, /command .* does not exist/);
    });

    it("should fail if the command doesn't exist ", function(){
      expect(this.proxy.command.bind(this.proxy, "non-existent-command")).to.throw(Error, /command .* does not exist/);
    });

    it("should fail if the command is not a function ", function(){
      expect(this.proxy.command.bind(this.proxy, "noFunction")).to.throw(Error, /command .* is not a function/);
    });

    it("should call the correct command", function(){
      this.proxy.command("goodCommand");
      this.commands.goodCommand.calledOnce.should.equal(true);
      this.commands.goodCommand.calledWith().should.equal(true);
    });

    it("should pass the arguments correctly", function(){
      this.proxy.command("goodCommand", 1, "hello", {foo: "bar"});
      this.commands.goodCommand.calledWith(1, "hello", {foo:"bar"}).should.equal(true);
    });
  });

  describe("prototype.registerHook()", function(){
    beforeEach(function(){
      this.proxy = new this.Proxy();
      this.hooks.registerHook.reset();
      this.fn = function(){};
    });

    it("should call hooks ", function(){
      this.proxy.registerHook("hookName", this.fn);
      this.hooks.registerHook.calledWith("hookName", this.fn);
    });

  });
  
});





