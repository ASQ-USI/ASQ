var chai         = require('chai')
, chaiAsPromised = require("chai-as-promised")
, assert         = chai.assert
, expect         = chai.expect
, express        = require('express')
, lib        = require('../lib')


// support for promises
require("mocha-as-promised")();
chai.use(chaiAsPromised);


describe('fs-utils', function() {

  describe('.getExtension(filename)', function(){
    it.skip('should be tested')
  });

  describe('.getFirstHtmlFile(path)', function(){
    it.skip('should be tested')
  });

  describe('.removeRecursive(path, cb)', function(){
    it.skip('should be tested')
  });

});
