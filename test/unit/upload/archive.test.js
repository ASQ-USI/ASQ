// adapted from https://github.com/sharelatex/web-sharelatex/blob/master/test/UnitTests/coffee/Uploads/ArchiveManagerTests.coffee

"use strict";

var SandboxedModule, chai, events, modulePath, should, sinon;
var sinon = require('sinon');
var chai = require('chai');
var should = chai.should();
var modulePath = "../../../lib/upload/archive";
var SandboxedModule = require('sandboxed-module');
var events = require("events");

describe("archive.js", function() {
  beforeEach(function() {
    this.logger = {
      error: sinon.stub(),
      log: sinon.stub()
    };
    this.process = new events.EventEmitter;
    this.process.stdout = new events.EventEmitter;
    this.process.stderr = new events.EventEmitter;
    this.child = {
      spawn: sinon.stub().returns(this.process)
    };

    this.ArchiveManager = SandboxedModule.require(modulePath, {
      requires: {
        'logger-asq': this.logger,
        "child_process": this.child
      }
    });
  });

  describe("extractZipArchive", function() {
    beforeEach(function() {
      this.source = "/path/to/zip/source.zip";
      this.destination = "/path/to/zip/destination";
      this.callback = sinon.stub();
    });

    describe("successfully", function() {
      beforeEach(function(done) {
        this.ArchiveManager.extractZipArchive(this.source, this.destination, done);
        this.process.emit("exit");
      });

      it("should run unzip", function() {
        this.child.spawn.calledWithExactly("unzip", [this.source, "-d", this.destination]).should.equal(true);
      });

      it("should log the unzip", function() {
        this.logger.log.calledWith(sinon.match.any, "unzipping file").should.equal(true);
      });
    });
    
    describe("with an error on stderr", function() {
      beforeEach(function(done) {
        this.ArchiveManager.extractZipArchive(this.source, this.destination, (function(_this) {
          return function(error) {
            _this.callback(error);
            return done();
          };
        })(this));
        this.process.stderr.emit("data", "Something went wrong");
        this.process.emit("exit");
      });

      it("should return the callback with an error", function() {
        this.callback.calledWithExactly(new Error("Something went wrong")).should.equal(true);
      });

      it("should log out the error", function() {
        this.logger.error.called.should.equal(true);
      });
    });
  });
});
