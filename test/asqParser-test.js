var sugar = require('sugar'),
  chai = require('chai'),
  assert = chai.assert,
  asqParser = require('../lib/asqParser');


var testString="";
testString += "  <section class=\"step\" id=\"slide-02\">";
testString += "        <article class=\"assessment multi-choice aa-0-n custom-1\" id=\"q-2\">";
testString += "            <h3 class=\"stem\">The interface of a software component:<\/h3>";
testString += "            <ol class=\"upper-alpha\">";
testString += "                <li class=\"option\">";
testString += "                    describes the internal features of the component’s";
testString += "                <\/li>";
testString += "                <li class=\"option\">";
testString += "                    clearly separates the surface of the component from its internal implementation";
testString += "                <\/li>";
testString += "                <li class=\"option\">";
testString += "                    describes the functionality provided by the component";
testString += "                <\/li>";
testString += "                <li class=\"option\">";
testString += "                    references the required interfaces on which the component depends upon";
testString += "                <\/li>";
testString += "                <li class=\"option\">";
testString += "                    needs to be kept as simple as possible";
testString += "                <\/li>";
testString += "            <\/ol>";
testString += "          <\/article>";
testString += "        <\/section>";


//asqParser.parse(testString);


describe('AsqParser', function() {
   describe('.parse(html, callback)', function(){

    //var generated = 
    asqParser.parse(testString, function(err, generated){
      expected = [{"stem":"<h3 class=\"stem\">The interface of a software component:</h3>","type":"","options":[{"option":"                    describes the internal features of the component’s                ","classList":"option"},{"option":"                    clearly separates the surface of the component from its internal implementation                ","classList":"option"},{"option":"                    describes the functionality provided by the component                ","classList":"option"},{"option":"                    references the required interfaces on which the component depends upon                ","classList":"option"},{"option":"                    needs to be kept as simple as possible                ","classList":"option"}]}]

      it("should return an array", function(){
        assert.isArray(generated, "generated object should be an array");
      });

      it("should have correct number of options", function(){
        assert.equal(generated[0].options.length, 5, "generated object should have 5 options");
      });

      it("should return an object that matches the spec example object", function(){
       
        assert.deepEqual(generated, expected, "generated object should be deepEqual to spec object");
      }); 

    });
    
  });

  describe('.parse(html) with promise', function(){

    //var generated = 
    asqParser.parse(testString).then(function(generated){

      expected = [{"stem":"<h3 class=\"stem\">The interface of a software component:</h3>","type":"","options":[{"option":"                    describes the internal features of the component’s                ","classList":"option"},{"option":"                    clearly separates the surface of the component from its internal implementation                ","classList":"option"},{"option":"                    describes the functionality provided by the component                ","classList":"option"},{"option":"                    references the required interfaces on which the component depends upon                ","classList":"option"},{"option":"                    needs to be kept as simple as possible                ","classList":"option"}]}]

      it("should return an array", function(){
        assert.isArray(generated, "generated object should be an array");
      });

      it("should have correct number of options", function(){
        assert.equal(generated[0].options.length, 5, "generated object should have 5 options");
      });

      it("should return an object that matches the spec example object", function(){
       
        assert.deepEqual(generated, expected, "generated object should be deepEqual to spec object");
      });
    });
  });

});

