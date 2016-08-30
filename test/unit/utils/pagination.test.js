const chai = require('chai')
const should = chai.should();
const expect = chai.expect;
const pagination = require('../../../lib/utils/pagination.js');

describe('lib/utils/pagination', function(){
  describe('calcNumOfItemsPerPage()', function(){
    it('should throw if the default page size is bigger than max', function(){
       expect(pagination.calcNumOfItemsPerPage.bind(pagination, 2, 1, 1))
        .to.throw(/default page size cannnot be bigger than max/)
    });

    it('should return the user\'s choice if it\'s within bounds', function(){
       pagination.calcNumOfItemsPerPage(1,1,1).should.equal(1);
       pagination.calcNumOfItemsPerPage(1,2,2).should.equal(2);
       pagination.calcNumOfItemsPerPage(1,3,2).should.equal(2);
    });

    it('should return the max when the user\'s choice is bigger than the max', function(){
       pagination.calcNumOfItemsPerPage(1,1,2).should.equal(1);
       pagination.calcNumOfItemsPerPage(1,2,3).should.equal(2);
       pagination.calcNumOfItemsPerPage(1,2,100).should.equal(2);
    });

    it('should return the default when the user\'s choice less than or equal to 0', function(){
       pagination.calcNumOfItemsPerPage(1,1,0).should.equal(1);
       pagination.calcNumOfItemsPerPage(1,2,-1).should.equal(1);
    });
  });

  describe('calcNumOfPages()', function(){
    it('should throw if the `totalItems` are less than 0', function(){
       expect(pagination.calcNumOfPages.bind(pagination, -1, 1))
        .to.throw(/totalItems should be a positive Integer/);
    });

    it('should throw if the `perPage` items are less than 1', function(){
       expect(pagination.calcNumOfPages.bind(pagination, 1, -1))
        .to.throw(/perPage should be a positive Integer greater than 0/);
      expect(pagination.calcNumOfPages.bind(pagination, 1, 0))
        .to.throw(/perPage should be a positive Integer greater than 0/)
    });

    it('should calculate the number of pages correctly', function(){
       pagination.calcNumOfPages(1,1).should.equal(1);
       pagination.calcNumOfPages(1,2).should.equal(1);
       pagination.calcNumOfPages(4,1).should.equal(4);
       pagination.calcNumOfPages(4,3).should.equal(2);
    });
  });

  describe('sanitizePaginationOptions()', function(){
    it('should return the original values if they are integers', function(){
      const payload = {
        perPage: 1,
        page: 10,
      }
      const res = pagination.sanitizePaginationOptions(payload);
        res.should.have.property("perPage");
        res.perPage.should.equal(1);
        res.should.have.property("page");
        res.page.should.equal(10);
    });

    it('should allow negative integers', function(){
      const payload = {
        perPage: -1,
        page: -10,
      }
      const res = pagination.sanitizePaginationOptions(payload);
        res.should.have.property("perPage");
        res.perPage.should.equal(-1);
        res.should.have.property("page");
        res.page.should.equal(-10);
    });

    it('should floor floats', function(){
      const payload = {
        perPage: -1.1,
        page: -10.7,
      }
      const res = pagination.sanitizePaginationOptions(payload);
        res.should.have.property("perPage");
        res.perPage.should.equal(-1);
        res.should.have.property("page");
        res.page.should.equal(-10);
    });

    it('should add default values if missing or undefined', function(){
      const payload = {
        perPage: undefined,
      }
      const res = pagination.sanitizePaginationOptions(payload);
        res.should.have.property("perPage");
        res.perPage.should.equal(-1);
        res.should.have.property("page");
        res.page.should.equal(0);
    });

    it('should only return `perPage` and `page`', function(){
      const payload = {
        perPage: 10,
        page: 10,
        extraField1: 10,
        extraField2: 10
      }
      const res = pagination.sanitizePaginationOptions(payload);
        res.should.have.property("perPage");
        res.should.have.property("page");
        res.should.not.have.property("extraField1");
        res.should.not.have.property("extraField2");
    });
  });
});