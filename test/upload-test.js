var sugar = require('sugar')
, chai = require('chai')
, chaiAsPromised = require("chai-as-promised")
, assert = chai.assert
, expect = chai.expect
, request = require('supertest')
, express = require('express');


require("mocha-as-promised")();
chai.use(chaiAsPromised);


describe('upload', function() {

   //callback tests
   describe('.post(req, res)', function(){
    it.skip("should return a json object ")
  });

});
