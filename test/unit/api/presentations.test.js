const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const should = chai.should();
const expect = chai.expect;
chai.use(sinonChai);
const SandboxedModule = require('sandboxed-module');
const Promise = require('bluebird');
require('sinon-as-promised')(Promise);
const modulePath = '../../../lib/api/presentations';


describe('lib/api/presentations', function(){
  describe('list()', function(){
    before(function(){
      const presentationModel = this.presentationModel = {};
      presentationModel.find = sinon.stub().returns(presentationModel);
      presentationModel.sort = sinon.stub().returns(presentationModel);
      presentationModel.skip = sinon.stub().returns(presentationModel);
      presentationModel.limit = sinon.stub().returns(presentationModel);
      presentationModel.count = sinon.stub().returns(presentationModel);
      presentationModel.lean = sinon.stub().returns(presentationModel);
      presentationModel.exec = sinon.stub();
      presentationModel.exec.onCall(0).resolves( [
        {
          _id: '0123456789abcdef01234567'
        },
        {
          _id: 'abcdef0123456789abcdef01'
        }
      ])
        .onCall(1).resolves(110);

      this.lodash = {
        pick : sinon.stub().returns({}),
        forOwn : sinon.stub().returns({})
      }

      this.db = {
        model : function(){
          return presentationModel;
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
      this.presentationsApi = SandboxedModule.require(modulePath, {
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
      this.presentationModel.find.reset();
      this.presentationModel.sort.reset();
      this.presentationModel.skip.reset();
      this.presentationModel.limit.reset();
      this.presentationModel.lean.reset();
      this.presentationModel.count.reset();
      this.presentationModel.exec.reset();
      this.lodash.pick.reset();
      this.lodash.forOwn.reset();
      this.pagination.sanitizePaginationOptions.reset();
      this.pagination.calcNumOfItemsPerPage.reset();
      this.pagination.calcNumOfPages.reset();
      // we need to reset the return array cause we modify it in place
      // and subsequent tests fail
      this.presentationModel.exec.onCall(0).resolves( [
        {
          _id: '0123456789abcdef01234567'
        },
        {
          _id: 'abcdef0123456789abcdef01'
        }
      ])
        .onCall(1).resolves(110);
    })
    it('should filter and sanitize the options', function(done){
      const filters = ['title', 'owner', 'course', 'presentationFramework', 'lastSession', 'lastEdit', 'conversionStatus'];
      const opts = {
        title : 'A Title'
      };
      this.lodash.pick.returns(opts);
      this.presentationsApi.list(opts).then(function(){
        this.lodash.pick.should.have.been.calledWith(opts, filters);
        this.lodash.forOwn.should.have.been.calledWith(opts, this.mongoSanitizeStub);
        done();
      }.bind(this))
    });

    it('should sanitize pagination options and calculate the results to show per page', function(done){
      this.presentationsApi.list({}).then(function(){
        this.pagination.sanitizePaginationOptions.should.have.been.calledWith({});
        this.pagination.calcNumOfItemsPerPage.should.have.been.calledWith(30, 100, 10);
        done();
      }.bind(this))
    });

    it('should query with the right options', function(done){
      const opts = {
        title : 'A title'
      };
      this.lodash.pick.returns(opts);
      this.lodash.forOwn.returns(opts);
      this.presentationsApi.list(opts).then(function(){
        this.presentationModel.find.should.have.been.calledWith(opts);
        this.presentationModel.sort.should.have.been.calledWith({'lastEdit': -1});
        this.presentationModel.skip.should.have.been.calledWith(0);
        this.presentationModel.limit.should.have.been.calledWith(10);
        this.presentationModel.lean.should.have.been.calledOnce;
        this.presentationModel.exec.should.have.been.calledTwice;
        this.presentationModel.count.should.have.been.calledWith(opts);
        done();
      }.bind(this));
    });

    it('should return correctly formatted results', function(done){
      const opts = {
        title : 'A title'
      };
      this.lodash.pick.returns(opts);
      this.lodash.forOwn.returns(opts);
      this.presentationsApi.list(opts).then(function(res){
       expect(res).to.deep.equal({
        presentations: [
          {
            id: '0123456789abcdef01234567'
          },
          {
            id: 'abcdef0123456789abcdef01'
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
