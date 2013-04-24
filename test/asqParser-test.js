var fs = require('fs'), 
  sugar = require('sugar'),
  chai = require('chai'),
  chaiAsPromised = require("chai-as-promised"),
  asqParser = require('../lib/asqParser'),
  expected = require('./fixtures/multiple-choice'),
  cheerio = require('cheerio'),
  assert = chai.assert,
  expect = chai.expect;

require("mocha-as-promised")();
chai.use(chaiAsPromised);

describe('AsqParser', function() {

  // assets for multiple question
  var mCHtml = fs.readFileSync( "test/fixtures/multiple-choice.html" ),
    htmlMCString    = cheerio.load( mCHtml ).html(),
  //assets for multiple question without id
    mCNoIDHtml = fs.readFileSync( "test/fixtures/multiple-choice-no-id.html" ),
    htmlMCNoIDString    = cheerio.load( mCNoIDHtml ).html();

   //callback tests
   describe('.parse(html, callback)', function(){

    asqParser.parse(htmlMCString, function(err, generated){
      it("should return an object with a correct number of options that matches the reference object", function(){
        expect(generated).to.deep.equals(expected)
          .with.deep.property("q-2.options.length", 5);
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

  // promise tests
  describe('.parse(html) with promise', function(){
    var promise = asqParser.parse(htmlMCString);

    it("should return an array with a correct number of options that matches the reference object", function(){
      return expect(promise).to.eventually.deep.equals(expected)
        .with.deep.property("q-2.options.length", 5);
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
