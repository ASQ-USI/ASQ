var fs = require('fs'), 
  sugar = require('sugar'),
  chai = require('chai'),
  chaiAsPromised = require("chai-as-promised"),
  asqParser = require('../lib/asqParser'),
  expectedMC = require('./fixtures/multiple-choice'),
  expectedTI = require('./fixtures/text-input'),
  cheerio = require('cheerio'),
  assert = chai.assert,
  expect = chai.expect;

require("mocha-as-promised")();
chai.use(chaiAsPromised);

describe('AsqParser', function() {

  // assets for multi-choice
  var mCHtml = fs.readFileSync( "test/fixtures/multiple-choice.html" ),
    htmlMCString    = cheerio.load( mCHtml ).html(),
  //assets for multi-choice without id
    mCNoIDHtml = fs.readFileSync( "test/fixtures/multiple-choice-no-id.html" ),
    htmlMCNoIDString    = cheerio.load( mCNoIDHtml ).html(),
  //assets for text-input
    tIHtml = fs.readFileSync( "test/fixtures/text-input.html" ),
    htmlTIString    = cheerio.load( tIHtml ).html(),
  //assets for text-input without id
    tINoIDHtml = fs.readFileSync( "test/fixtures/text-input-no-id.html" ),
    htmlTINoIDString    = cheerio.load( tINoIDHtml ).html();

   //callback tests for multi-choice questions
   describe('.parse(html, callback) for multi-choice', function(){

    it.skip("should have tested options");
    it.skip("have the next test rewritten propely");

    asqParser.parse(htmlMCString, {outputFormat:'Object'} ,function(err, generated){
      it("should return an object with a correct number of options that matches the reference object", function(){
        expect(generated).to.deep.equals(expectedMC)
          .with.deep.property("q-2.questionOptions.length", 5);
      });
    });  

    asqParser.parse(htmlMCNoIDString, function(err, generated){
      it("should return an error when there are is a question without id", function(){
        expect(err).to.not.equal(null);
      });
      it("should return null data when there are is a question without id", function(){
        expect(generated).to.equal(null);
      });
    });
  });

  //callback tests for text-input questions
  describe('.parse(html, callback) for text-input', function(){

    asqParser.parse(htmlTIString, {outputFormat:'Object'} ,function(err, generated){
      it("should return an object that matches the reference object", function(){
        expect(generated).to.deep.equals(expectedTI)
          .with.property("q-2.stemText", "The interface of a software component:");
      });
    });  

    asqParser.parse(htmlTINoIDString, function(err, generated){
      it("should return an error when there are is a question without id", function(){
        expect(err).to.not.equal(null);
      });
      it("should return null data when there are is a question without id", function(){
        expect(generated).to.equal(null);
      });
    });
  });

  // promise tests
  describe('.parse(html) with promise', function(){
    var promise = asqParser.parse(htmlMCString, {outputFormat: 'Object'});

    it("should return an object with a correct number of options that matches the reference object", function(){
      return expect(promise).to.eventually.deep.equals(expectedMC)
        .with.deep.property("q-2.questionOptions.length", 5);
    });

    var promiseNoId = asqParser.parse(htmlMCNoIDString);
    it("should reject the promise when there is a question without id", function(){
      return expect(promiseNoId).to.be.rejected;
    });
    it("should return an array with errors data when there is a question without id", function(){
      expect(promiseNoId).to.eventually.equal(null);
    });
  });

});
