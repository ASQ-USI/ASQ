"use strict";

var chai = require('chai');
var sinon = require("sinon");
var should = chai.should();
var SandboxedModule = require('sandboxed-module');
var Promise = require('bluebird');
var modulePath = "../../../lib/upload/upload";

describe("upload.js", function(){
  before(function(){
    try{


    var uploadDir = this.uploadDir = "path/to/upload/dir";
    var presentationHtml = this.presentationHtml = "<html></html>"
    this.app = {
      get: function(){return uploadDir}
    }

    //mock db
    this.db = {model: function(){}};
    sinon.stub(this.db, "model")
    .withArgs("Slideshow").returns({
      "findById" : function(){
        return {
          exec: function(){ return Promise.resolve(presentation);}
        }
      }
    })

    this.upload = SandboxedModule.require(modulePath, {
      requires: {
        // careful here this is promisified in upload.js. This means
        // that parse.js will have a call on `readFileAsync` instead of `readFile`
        // same writeFile   
        'fs': this.fs = {
          readFile : sinon.stub().callsArgWith(2, null, presentationHtml),
          writeFile : sinon.stub().callsArgWith(2, null, "")
        },
        './archive' : this.archive = {},
        '../parse/parse' : this.parse = {},
        '../presentationAdapter/adapters': this.adapters = {},
        '../presentation/presentationCreate' : this.presentationCreate = {},
        '../presentation/presentationDelete' : this.presentationDelete = {},
        '../utils/fs' : this.fsUtils = {},
        '../logger' :  {appLogger : {debug:function(){}}}
      },
      globals : {
        app : this.app,
        db : this.db
      }
    });
  }catch(err){
    console.log(err.stack)
  }
  });

  describe("createPresentationFromZipArchiveElems", function() {
    it.skip("should test createPresentationFromZipArchiveElems()")
  });

  describe("updatePresentationFromZipArchive", function() {
    it.skip("should test updatePresentationFromZipArchive()")
  });

  describe("createPresentationFromZipArchive", function() {
    beforeEach(function(done) {
      this.source = "/path/to/zip/file-name.zip";
      this.owner_id = "owner-id-123";
      this.name = "Presentation name";
      this.presentation = {
        "_id": "presentation-id-123",
        "title": "SamplePresentation",
        "owner": "owner-id-123",
        "course": "General",
        save: sinon.stub().returns(Promise.resolve(this))
      };
      this.destination = this.uploadDir + '/' + this.presentation._id;

      this.fs.readFile.reset();
      this.fs.writeFile.reset();
      this.presentationCreate.createBlankSlideshow = sinon.stub().returns(Promise.resolve(this.presentation));
      this.archive.extractZipArchive = sinon.stub().callsArg(2);
      this.htmlPath ="path/to/upload/dir/presentation-id-123/samplePresentationRubrics.html'";
      this.adapters.impressAsqFork = { getSlidesTree: sinon.stub()};
      this.fsUtils.getFirstHtmlFile = sinon.stub().returns(Promise.resolve(this.htmlPath));
      this.parse.escapeDustBrackets = sinon.stub().returns(this.presentationHtml);
      this.parse.parseAndPersist = sinon.stub().returns(Promise.resolve(true));
      this.parseAndPersist = sinon.stub();
      
      this.upload.createPresentationFromZipArchive(this.owner_id, this.name, this.source)
        .then(function(){
          done();
        })
        .catch(function(err){
          done(err);
        });
    });

    it("should create a presentation owned by the owner_id", function() {
      this.presentationCreate.createBlankSlideshow.calledWith(this.owner_id).should.equal(true);
    });

    it("should create a presentation with the correct name", function() {
      this.presentationCreate.createBlankSlideshow.calledWith(sinon.match.any, this.name).should.equal(true);
    });

    it("should extract the zip file contents into the destination folder", function() {
      this.archive.extractZipArchive.calledWith(this.source, this.destination).should.equal(true);
    });

    it("should get the first HTML file", function() {
      this.fsUtils.getFirstHtmlFile.calledWith(this.destination).should.equal(true);
    });

    it("should escape brackets for dust", function() {
      this.parse.escapeDustBrackets.calledWith(this.presentationHtml).should.equal(true);
    });

    it("should store the html file after escaping", function() {
      this.fs.writeFile.calledAfter( this.parse.escapeDustBrackets).should.equal(true);
      this.fs.writeFile.calledWith(this.htmlPath).should.equal(true);
    });

    it("should generate the slidesTree", function() {
      this.adapters.impressAsqFork.getSlidesTree.calledWith(this.presentationHtml).should.equal(true);
    });

    it("should save the presentation", function() {
      this.presentation.save.called.should.equal(true);
    });

    it("should call parseAndPersist with the correct id", function() {
      this.parse.parseAndPersist.calledWith(this.presentation._id).should.equal(true);
    });

  });
});
