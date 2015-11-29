"use strict";

var chai = require('chai')
var sinon = require("sinon");
var should = chai.should();
var SandboxedModule = require('sandboxed-module');
var Promise = require('bluebird');
var modulePath = "../../../lib/presentation/presentationCreate";


describe("presentationCreate.js", function(){
  before(function(){
    var name = this.name = "presentation-name"
    var owner_id = this.owner_id = "owner-id-123";

    this.presentation = {
        "_id": "presentation-id-123",
        "title": name,
        "owner": owner_id,
        "course": "General",
        setQuestionsPerSlide: function(){},
        setStatsPerSlide: function(){},
        save: function(){ return Promise.resolve(this);}
      }

    //mock db
    var db = {model: function(){}};
    var createStub = this.createStub = sinon.stub().returns(Promise.resolve(this.presentation));
    var exec = { exec: sinon.stub().returns(Promise.resolve(true))}
    var findByIdAndUpdateStub = this.findByIdAndUpdateStub = sinon.stub().returns(exec);

    sinon.stub(db, "model")
    .withArgs("Slideshow").returns({
      "create" : createStub,
    })
    .withArgs("User").returns({
      "findByIdAndUpdate" : findByIdAndUpdateStub
    });

    this.defaultPresentationSettings = {
      "presentation": [{
        "key": "maxNumSubmissions",
        "value": "-1",
        "kind": "number",
        "level": "presentation",
      }]
    };

    var destination = "/Users/vassilis/Sites/ASQ-USI/ASQ/test";
    this.presentationCreate = SandboxedModule.require(modulePath, {
      requires: {
        "lodash":require('lodash'),
        "../settings/defaultPresentationSettings.js" : this.defaultPresentationSettings
      },
      globals : { db : db }
    });
  })

  describe("createBlankSlideshow", function(){

    beforeEach(function(done){
      this.createStub.reset();
      this.findByIdAndUpdateStub.reset();
      this.presentationCreate.createBlankSlideshow(this.owner_id, this.name)
      .then(function(res){
        this.result = res;
        done();
      }.bind(this))
      .catch(function(err){
        done(err)
      })
    });

    it("should call create with the correct arguments", function(){
      this.createStub.calledWith({
          title : this.name,
          owner : this.owner_id,
          settings: this.defaultPresentationSettings['presentation']
        }).should.equal(true);
    });

    it("should add the presentation to the user's presentations", function(){
      this.findByIdAndUpdateStub.calledWith(this.owner_id,{
          $push: { slides : this.presentation._id }
        }).should.equal(true);
    });

    it("should return the presentation", function(){
      this.result.should.equal(this.presentation);
    });

  });
});
