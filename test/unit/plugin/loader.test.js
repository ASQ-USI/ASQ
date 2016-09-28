"use strict";

var chai = require('chai');
var sinon = require("sinon");
var should = chai.should();
var expect = chai.expect;
var SandboxedModule = require('sandboxed-module');
var Promise = require('bluebird');
var modulePath = "../../../lib/plugin/loader";
var _ = require("lodash");

describe("loader.js", function(){
 before(function(){
    this.existsSync = sinon.stub().returns(true)
      .withArgs("plugin/dir/that/does/not/exists").returns(false);
    this.readdir = sinon.stub();

    this.statsObj = {
      isDirectory: sinon.stub().returns(true)
    }

    this.lstat = sinon.stub().callsArgWith(1, null, this.statsObj),

    this.fs = {
      existsSync: this.existsSync,
      readdir: this.readdir,
      lstat: this.lstat,
      mkdirpSync : sinon.stub()
    }

    this.pathResolve = sinon.stub();
    this.pathResolve.withArgs('/path/to/root/dir', './plugins')
        .returns('plugin/dir/that/exists');
    this.pathResolve.withArgs('/path/to/root/dir', '/does/not/exist')
        .returns('plugin/dir/that/does/not/exists');

    this.app = {
      get: sinon.stub(),
      set: sinon.stub()
    }

    this.config = {
      rootDir: '/path/to/root/dir'
    };

    this.loader = SandboxedModule.require(modulePath, {
      requires: {
        'fs-extra' : this.fs,
        path: this.path = {resolve: this.pathResolve},
        "../../config" : this.config,
        "path/to/plugin" : this.plugin = sinon.stub(),
        "./proxy" : this.proxy = sinon.stub()
      },
      singleOnly: "true"
    });
  });

  describe("checkPluginDir()", function(){
    beforeEach(function(){
      this.existsSync.reset();
      this.readdir.reset();
      this.fs.mkdirpSync.reset();
      this.pathResolve.reset();
    });

    it("should throw an error if config.pluginDir is undefined", function(){
      expect(this.loader.checkPluginDir.bind(this.loader)).to.throw(Error, 
        /config\.pluginDir is null or undefined/);
    });

    it("should check if the dir exists", function(){
      this.config.pluginDir = "./plugins";
      this.loader.checkPluginDir();
      this.existsSync.calledOnce.should.equal(true);
    });

    it("should create the pluginDir if it doesn't exist", function(){
      this.config.pluginDir = "/does/not/exist";
      this.loader.checkPluginDir();
      this.existsSync.calledOnce.should.equal(true);
      this.fs.mkdirpSync.calledOnce.should.equal(true);
    });

  });
  
  describe.skip("loadPlugin()", function(){
    beforeEach(function(done){
      this.plugin.reset();
      this.proxy.reset();
      this.lstat.reset();
      this.readdir.reset();
      this.statsObj.isDirectory.reset();
      this.loader.loadPlugin("path/to/plugin")
        .then(function(){done();})
        .catch(function(err){done(err);})
    });

    it("should check if the path is a directory", function(){
      this.lstat.calledOnce.should.equal(true);
      this.lstat.calledWith("path/to/plugin").should.equal(true);
      this.statsObj.isDirectory.calledOnce.should.equal(true);
    });

    it("should instantiate the plugin", function(){
      this.plugin.calledOnce.should.equal(true);
      this.proxy.calledOnce.should.equal(true);
    });

    it.skip("in case of an error it should log it", function(){
    });

  });
});





