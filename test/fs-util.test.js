var chai = require('chai')
, chaiAsPromised = require("chai-as-promised")
, assert = chai.assert
, expect = chai.expect
, express = require('express')
, fsUtil = require('../lib/fs-util')


// support for promises
require("mocha-as-promised")();
chai.use(chaiAsPromised);


describe('fs-util', function() {

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
