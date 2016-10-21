const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const should = chai.should();
chai.use(sinonChai);
const SandboxedModule = require('sandboxed-module');
const modulePath = '../../../lib/download/archive';

describe('lib/download/arhive.js', function(){

  before(function(){
    this.logger = {
      log: sinon.stub()
    }
    this.archive = {
      glob: sinon.stub(),
      finalize: sinon.stub()
    }
    this.archiver = sinon.stub().returns(this.archive);

    // load module with mocked modules
    this.questionsApi = SandboxedModule.require(modulePath, {
      requires: {
        'logger-asq': this.logger,
        'archiver': this.archiver,
      }
    });
  })

  describe('createArchiveStream()', function(){
    beforeEach(function(){
      this.archive.glob.reset()
      this.archive.finalize.reset()
      this.archiver.reset()
    });

    it('should log the operation', function(){
      this.questionsApi.createArchiveStream("a/path", "dustfile")
      this.logger.log.should.have.been.calledWith({
        path: "a/path",
        dustfile: "dustfile"
      }, "preparing zip file");
    });

    it('should use the zip format', function(){
      this.questionsApi.createArchiveStream("a/path", "dustfile")
      this.archiver.should.have.been.calledWith('zip');
    });

    it('should use the right path and ignore the .dust file', function(){
      this.questionsApi.createArchiveStream("a/path", "dustfile")
      this.archive.glob.should.have.been.calledWith('**/*', {
        cwd: "a/path",
        ignore: ["dustfile"]
      });
    });

    it('should finalize the archive file', function(){
      this.questionsApi.createArchiveStream("a/path", "dustfile")
      this.archive.finalize.should.have.been.calledOnce
    });
  });
});