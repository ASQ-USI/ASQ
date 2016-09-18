const chai = require('chai');
const sinonChai = require("sinon-chai");
const sinon = require('sinon');
const should = chai.should();
const expect = chai.expect;
chai.use(sinonChai);
const SandboxedModule = require('sandboxed-module');
const Promise = require('bluebird');
require('sinon-as-promised')(Promise);
const modulePath = '../../../lib/api/questions';


describe('lib/api/questions', function(){
  describe('list()', function(){
    before(function(){
      const questionModel = this.questionModel = {};
      questionModel.find = sinon.stub().returns(questionModel);
      questionModel.sort = sinon.stub().returns(questionModel);
      questionModel.skip = sinon.stub().returns(questionModel);
      questionModel.limit = sinon.stub().returns(questionModel);
      questionModel.count = sinon.stub().returns(questionModel);
      questionModel.lean = sinon.stub().returns(questionModel);
      questionModel.exec = sinon.stub();
      questionModel.exec.onCall(0).resolves( [
        {
          _id: "0123456789abcdef01234567"
        },
        {
          _id: "abcdef0123456789abcdef01"
        }
      ])
        .onCall(1).resolves(110);

      this.lodash = {
        pick : sinon.stub().returns({}),
        forOwn : sinon.stub().returns({})
      }

      this.db = {
        model : function(){
          return questionModel;
        }
      }
      this.mongoSanitizeStub = sinon.stub();
      this.pagination =  {
        sanitizePaginationOptions: sinon.stub().returns({
          page: 1,
          perPage: 10
        }),
        calcNumOfItemsPerPage: sinon.stub().returns(10),
        calcNumOfPages: sinon.stub().returns(11)
      }

      // load module with mocked modules
      this.questionsApi = SandboxedModule.require(modulePath, {
        requires: {
          'lodash': this.lodash,
          'mongo-sanitize' :  this.mongoSanitizeStub,
          '../utils/pagination' : this.pagination
        },
        globals : {
          db : this.db
        }
      });
    });

    beforeEach(function(){
      this.questionModel.find.reset();
      this.questionModel.sort.reset();
      this.questionModel.skip.reset();
      this.questionModel.limit.reset();
      this.questionModel.lean.reset();
      this.questionModel.count.reset();
      this.questionModel.exec.reset();
      this.lodash.pick.reset();
      this.lodash.forOwn.reset();
      this.pagination.sanitizePaginationOptions.reset();
      this.pagination.calcNumOfItemsPerPage.reset();
      this.pagination.calcNumOfPages.reset();
      // we need to reset the return array cause we modify it in place
      // and subsequent tests fail
      this.questionModel.exec.onCall(0).resolves( [
        {
          _id: "0123456789abcdef01234567"
        },
        {
          _id: "abcdef0123456789abcdef01"
        }
      ])
        .onCall(1).resolves(110);
    })
    it('should filter and sanitize the options', function(done){
      const filters = ['type', 'author', 'date_created', 'date_modified'];
      const opts = {
        type : "asq-question-type"
      };
      this.lodash.pick.returns(opts);
      this.questionsApi.list(opts).then(function(){
        this.lodash.pick.should.have.been.calledWith(opts, filters);
        this.lodash.forOwn.should.have.been.calledWith(opts, this.mongoSanitizeStub);
        done();
      }.bind(this))
    });

    it('should sanitize pagination options and calculate the results to show per page', function(done){
      this.questionsApi.list({}).then(function(){
        this.pagination.sanitizePaginationOptions.should.have.been.calledWith({});
        this.pagination.calcNumOfItemsPerPage.should.have.been.calledWith(30, 100, 10);
        done();
      }.bind(this))
    });

    it('should query with the right options', function(done){
      const opts = {
        type : "asq-question-type"
      };
      this.lodash.pick.returns(opts);
      this.lodash.forOwn.returns(opts);
      this.questionsApi.list(opts).then(function(){
        this.questionModel.find.should.have.been.calledWith(opts);
        this.questionModel.sort.should.have.been.calledWith({'date_modified': -1});
        this.questionModel.skip.should.have.been.calledWith(0);
        this.questionModel.limit.should.have.been.calledWith(10);
        this.questionModel.lean.should.have.been.calledOnce;
        this.questionModel.exec.should.have.been.calledTwice;
        this.questionModel.count.should.have.been.calledWith(opts);
        done();
      }.bind(this));
    });

    it('should return correctly formatted results', function(done){
      const opts = {
        type : "asq-question-type"
      };
      this.lodash.pick.returns(opts);
      this.lodash.forOwn.returns(opts);
      this.questionsApi.list(opts).then(function(res){
       expect(res).to.deep.equal({
        questions: [
          {
            id: "0123456789abcdef01234567"
          },
          {
            id: "abcdef0123456789abcdef01"
          }
        ],
        page: 1,
        pages: 11
       })
        done();
      }.bind(this));
    });
  });
});
