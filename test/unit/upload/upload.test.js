'use strict';

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const should = chai.should();
const SandboxedModule = require('sandboxed-module');
const Promise = require('bluebird');
const modulePath = '../../../lib/upload/upload';

describe('upload.js', function(){
  before(function(){
    try{


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

    this.upload = SandboxedModule.require(modulePath, {
      requires: {
        // careful here this is promisified in upload.js. This means
        // that parse.js will have a call on `readFileAsync` instead of `readFile`
        // same writeFile  
        'read-chunk': function(path, start, finish, cb){ cb(null, 'chunk')}, 
        'file-type': this.fileType, 
        'fs': this.fs = {
          readFile : sinon.stub().callsArgWith(2, null, presentationHtml),
          writeFile : sinon.stub().callsArgWith(2, null, ''),
          unlink : sinon.stub().callsArgWith(1, null, ''),
          rename : sinon.stub().callsArg(2, null, '')
        },
        'logger-asq' : require('logger-asq'),
        './archive' : this.archive = {},
        './pdf' : this.pdf = {},
        '../parse/parse' : this.parse = {},
        '../presentationAdapter/adapters': this.adapters = {},
        '../presentation/presentationCreate' : this.presentationCreate = {},
        '../presentation/presentationDelete' : this.presentationDelete = {},
        '../utils/fs' : this.fsUtils = {}
      },
      globals : {
        db : this.db
      }
    });
  }catch(err){
    console.log(err.stack)
  }
  });

  describe('createPresentationFromFile', function() {
    before(function(){
      this.source = '/path/to/zip/file-name.zip';
      this.owner_id = 'owner-id-123';
      this.name = 'Presentation name';
      const pid = this.presentationId = 'presentation-id-123' ;

      sinon.stub(this.upload, "createPresentationFromZipArchive", function(){
        return Promise.resolve(pid);
      })
      sinon.stub(this.upload, "createPresentationFromPdfFile", function(){
        return Promise.resolve(pid);
      })
    })

    beforeEach(function(){
      this.upload.createPresentationFromZipArchive.reset();
      this.upload.createPresentationFromPdfFile.reset();
      this.fs.unlink.reset();
    })

    after(function(){
      this.upload.createPresentationFromZipArchive.restore();
      this.upload.createPresentationFromPdfFile.restore();
    })

    it('should create a presentation from zip if the uploaded file is a zip', function(done) {
      this.fileType.returns({ext: 'zip'});
      this.upload.createPresentationFromFile(this.owner_id, this.name, this.source)
        .then(function(){
          this.upload.createPresentationFromZipArchive.calledWith(
            this.owner_id, this.name, this.source).should.equal(true);

          this.upload.createPresentationFromPdfFile.called.should.equal(false);
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });

    it('should unlink the zip if the uploaded file is a zip', function(done) {
      this.fileType.returns({ext: 'zip'});
      this.upload.createPresentationFromFile(this.owner_id, this.name, this.source)
        .then(function(){
          this.fs.unlink.calledWith(this.source).should.equal(true);
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });

    it('should create a presentation from pdf if the uploaded file is a pdf', function(done) {
      this.fileType.returns({ext: 'pdf'});
      this.upload.createPresentationFromFile(this.owner_id, this.name, this.source)
        .then(function(){
          this.upload.createPresentationFromPdfFile.calledWith(
            this.owner_id, this.name, this.source).should.equal(true);

          this.upload.createPresentationFromZipArchive.called.should.equal(false);
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });

    it('should return the slideshow id from a zip upload', function(done) {
      this.fileType.returns({ext: 'zip'});
      this.upload.createPresentationFromFile(this.owner_id, this.name, this.source)
        .then(function(res){
          res.should.equal(this.presentationId);
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });

    it('should return the slideshow id from a pdf upload', function(done) {
      this.fileType.returns({ext: 'pdf'});
      this.upload.createPresentationFromFile(this.owner_id, this.name, this.source)
        .then(function(res){
          res.should.equal(this.presentationId);
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });
  });

  describe('createPresentationFromPdfFile', function() {
    beforeEach(function(done) {
      this.htmlPath ='path/to/upload/dir/presentation-id-123/samplePresentationRubrics.html';
      this.asqFilePath ='path/to/upload/dir/presentation-id-123/samplePresentationRubrics.asq.dust';
      this.source = '/path/to/zip/file-name.pdf';
      this.sourceBasename = 'file-name.pdf';
      this.owner_id = 'owner-id-123';
      this.name = 'Presentation name';
      this.presentation = {
        '_id': 'presentation-id-123',
        'title': 'SamplePresentation',
        'owner': 'owner-id-123',
        'course': 'General',
        'path': this.uploadDir + '/presentation-id-123',
        'asqFilePath': this.asqFilePath,
        save: sinon.stub().returns(Promise.resolve(this))
      };
      this.destination = path.join(this.uploadDir, this.presentation._id);
      this.presentationCreate.createBlankSlideshow = sinon.stub().returns(Promise.resolve(this.presentation));
      this.pdf.convertPdf2Html = sinon.stub().callsArg(2);
      this.fs.rename.reset();

      this.upload.createPresentationFromPdfFile(this.owner_id, this.name, this.source)
        .then(function(){
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });

    it('should create a presentation owned by the owner_id', function() {
      this.presentationCreate.createBlankSlideshow.calledWith(this.owner_id).should.equal(true);
    });

    it('should convert the pdf to html', function() {
      this.pdf.convertPdf2Html.calledWith(this.source, this.uploadDir + '/presentation-id-123').should.equal(true);
    });

    it('move the pdf to html directory', function() {
      const newPdfFilePath = path.resolve(this.uploadDir + '/presentation-id-123', this.sourceBasename )
      this.fs.rename.calledWith(this.source, newPdfFilePath).should.equal(true);
    });

    it('return the presentation id', function(done) {
      this.upload.createPresentationFromPdfFile(this.owner_id, this.name, this.source)
        .then(function(res){
          res.should.equal(this.presentation._id)
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });
  });

  describe('createPresentationFromZipArchive', function() {
    before(function(){
      sinon.stub(this.upload, "findAndProcessMainFile", function(){
        return Promise.resolve(true);
      })
    })

    beforeEach(function(done) {
      this.htmlPath ='path/to/upload/dir/presentation-id-123/samplePresentationRubrics.html';
      this.asqFilePath ='path/to/upload/dir/presentation-id-123/samplePresentationRubrics.asq.dust';
      this.source = '/path/to/zip/file-name.zip';
      this.owner_id = 'owner-id-123';
      this.name = 'Presentation name';
      this.presentation = {
        '_id': 'presentation-id-123',
        'title': 'SamplePresentation',
        'owner': 'owner-id-123',
        'course': 'General',
        'path': this.uploadDir + '/presentation-id-123',
        'asqFilePath': this.asqFilePath,
        save: sinon.stub().returns(Promise.resolve(this))
      };
      this.destination = path.join(this.uploadDir, this.presentation._id);
      this.upload.findAndProcessMainFile.reset();
      this.presentationCreate.createBlankSlideshow = sinon.stub().returns(Promise.resolve(this.presentation));
      this.archive.extractZipArchive = sinon.stub().callsArg(2);

      this.upload.createPresentationFromZipArchive(this.owner_id, this.name, this.source)
        .then(function(){
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });

    after(function(){
      this.upload.findAndProcessMainFile.restore();
    })

    it('should create a presentation owned by the owner_id', function() {
      this.presentationCreate.createBlankSlideshow.calledWith(this.owner_id).should.equal(true);
    });
``
    it('should create a presentation with the correct name', function() {
      this.presentationCreate.createBlankSlideshow.calledWith(sinon.match.any, this.name).should.equal(true);
    });

    it('should extract the zip file contents into the destination folder', function() {
      this.archive.extractZipArchive.calledWith(this.source, this.destination).should.equal(true);
    });

    it('should find and process the main file', function() {
      this.upload.findAndProcessMainFile.calledWith(this.presentation._id).should.equal(true);
    });

    it('return the presentation id', function(done) {
      this.upload.createPresentationFromPdfFile(this.owner_id, this.name, this.source)
        .then(function(res){
          res.should.equal(this.presentation._id)
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });
  });

  describe('findAndProcessMainFile', function() {

    beforeEach(function(done) {
      this.htmlPath ='path/to/upload/dir/presentation-id-123/samplePresentationRubrics.html';
      this.asqFilePath ='path/to/upload/dir/presentation-id-123/samplePresentationRubrics.asq.dust';
      this.name = 'Presentation name';
      let presentation = this.presentation = {
        '_id': 'presentation-id-123',
        'title': 'SamplePresentation',
        'owner': 'owner-id-123',
        'course': 'General',
        'path': this.uploadDir + '/presentation-id-123',
        'asqFilePath': this.asqFilePath,
        'save': sinon.stub().returns(Promise.resolve(this))
      };

      this.SlideshowModel.findById.returns({
        exec: function(){
          return Promise.resolve(presentation);
        }
      })

      this.destination = path.join(this.uploadDir, this.presentation._id);
      this.fs.writeFile.reset();
      this.adapters.impressAsqFork = { getSlidesTree: sinon.stub()};
      this.fsUtils.getFirstHtmlFile = sinon.stub().returns(Promise.resolve(this.htmlPath));
      this.parse.parseAndPersist = sinon.stub().returns(Promise.resolve(true));
      this.parseAndPersist = sinon.stub();
      
      this.upload.findAndProcessMainFile(this.presentation._id)
        .then(function(){
          done();
        })
        .catch(function(err){
          done(err);
        });
    });

    it('should retrieve the presentation', function() {
      this.db.model.calledWith('Slideshow').should.equal(true);
    });

    it('should get the first HTML file', function() {
      this.fsUtils.getFirstHtmlFile.calledWith(this.destination).should.equal(true);
    });

    it('should generate the ASQ file', function() {
      this.fs.writeFile.calledWith(this.asqFilePath).should.equal(true);
    });

    it('should generate the slidesTree', function() {
      this.adapters.impressAsqFork.getSlidesTree.calledWith(this.presentationHtml).should.equal(true);
    });

    it('should update the last edit timestamp', function() {
      (Date.now() - this.presentation.lastEdit).should.be.lessThan(1000);
    });

    it('should save the presentation', function() {
      this.presentation.save.called.should.equal(true);
    });

    it('should call parseAndPersist with the correct id', function() {
      this.parse.parseAndPersist.calledWith(this.presentation._id).should.equal(true);
    });

  });

  describe('updatePresentationFromZipArchive', function() {
    before(function(){
      sinon.stub(this.upload, "findAndProcessMainFile", function(){
        return Promise.resolve(true);
      })
    })

    beforeEach(function(done) {
      this.htmlPath ='path/to/upload/dir/presentation-id-123/samplePresentationRubrics.html';
      this.asqFilePath ='path/to/upload/dir/presentation-id-123/samplePresentationRubrics.asq.dust';
      this.source = '/path/to/zip/file-name.zip';
      this.owner_id = 'owner-id-123';
      this.name = 'Presentation name';
      const pid = this.presentationId = 'presentation-id-123' ;
      let presentation = this.presentation = {
        '_id': 'presentation-id-123',
        'title': 'SamplePresentation',
        'owner': 'owner-id-123',
        'course': 'General',
        'path': this.uploadDir + '/presentation-id-123',
        'asqFilePath': this.asqFilePath,
        save: sinon.stub().returns(Promise.resolve(this))
      };


      this.SlideshowModel.findById.returns({
        exec: function(){
          return Promise.resolve(presentation);
        }
      });

      this.destination = path.join(this.uploadDir, this.presentation._id);
      this.fs.readFile.reset();
      this.fs.writeFile.reset();
      this.archive.extractZipArchive = sinon.stub().callsArg(2);
      this.presentationDelete.removeDbAssets = sinon.stub().returns(Promise.resolve(true));
      this.presentationDelete.removeFileAssets = sinon.stub().returns(Promise.resolve(true));
      
      this.upload.updatePresentationFromZipArchive(presentation._id, this.name, this.source, {})
        .then(function(){
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });

    after(function(){
      this.upload.findAndProcessMainFile.restore();
    })

    it('should remove the database assets associated with the presentation', function() {
      this.presentationDelete.removeDbAssets.calledWith(this.presentation._id).should.equal(true);
    });

    it('should not remove the Sessions associated with the presentation if the preserveSession option is set', function(done) {
      this.presentationDelete.removeDbAssets = sinon.stub().returns(Promise.resolve(true));
      this.upload.updatePresentationFromZipArchive(
        this.presentation._id, this.name, this.source, {preserveSession : true})
        .then(function(){
          this.presentationDelete.removeDbAssets.calledWith(this.presentation._id, ["Session"]).should.equal(true);
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });

    it('should remove the file assets associated with the presentation', function() {
      this.presentationDelete.removeFileAssets.calledWith(this.presentation._id).should.equal(true);
    });

    it('should set the correct presentation name', function(done) {
      this.presentationDelete.removeDbAssets = sinon.stub().returns(Promise.resolve(true));
      this.upload.updatePresentationFromZipArchive(this.presentation._id, "lename", this.source)
        .then(function(){
          this.presentation.title.should.equal("lename");
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });

    it('should keep the original name if the new name is undefined', function(done) {
      this.presentationDelete.removeDbAssets = sinon.stub().returns(Promise.resolve(true));
      this.upload.updatePresentationFromZipArchive(this.presentation._id, undefined, this.source)
        .then(function(){
          this.presentation.title.should.equal(this.name);
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });

    it('should retrieve the presentation', function() {
      this.SlideshowModel.findById.calledWith(this.presentation._id).should.equal(true);
    });

    it('should extract the zip file contents into the destination folder', function() {
      this.archive.extractZipArchive.calledWith(this.source, this.destination).should.equal(true);
    });

    it('should save the slideshow', function() {
      this.presentation.save.called.should.equal(true);
    });

    it('should find and process the main file', function() {
      this.upload.findAndProcessMainFile.calledWith(this.presentation._id).should.equal(true);
    });

    it('should return the slideshow id from a pdf upload', function(done) {
      this.fileType.returns({ext: 'pdf'});
      this.upload.updatePresentationFromZipArchive(
        this.presentation._id, this.name, this.source, {preserveSession : true})
        .then(function(res){
          res.should.equal(this.presentationId);
          done();
        }.bind(this))
        .catch(function(err){
          done(err);
        });
    });
  });
});
