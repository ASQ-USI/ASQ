"use strict";

var chai = require('chai')
var sinon = require("sinon");
var should = chai.should();
var SandboxedModule = require('sandboxed-module');
var Promise = require('bluebird');
var sinonAsPromised = require('sinon-as-promised')(Promise);
var modulePath = "../../../lib/settings/presentationSettings";


describe("presentationSettings.js", function(){
  before(function() {

    var settingsData = {
      's_id_1': {
        key: 'maxNumSubmissions',
        value: 0,
        kind: 'number',
      },

      's_id_2': {
        key: 'slideflow',
        value: 'follow',
        kind: 'select',
        params: {
          options: ['self', 'follow', 'ghost']
        }, 
      },

      's_id_3': {
        key: 'slideflow',
        value: 'self',
        kind: 'select',
        params: {
          options: ['self', 'follow', 'ghost']
        }, 
      },
    }


    var exercisesPerSlideData = {
      "slide03": [
        "5595a14e669d1d2a29eeb2a7"
      ],
      "slide02": [
        "5595a14e669d1d2a29eeb2a5"
      ]
    };

    var exercisesData = this.exercisesData = {
      '5595a14e669d1d2a29eeb2a7': {
        _id: '5595a14e669d1d2a29eeb2a7',
        settings: ['s_id_1', 's_id_2'],
        getSettings: function(){} 
      },

      '5595a14e669d1d2a29eeb2a5': {
        _id: '5595a14e669d1d2a29eeb2a5',
        settings: ['s_id_1', 's_id_3'],
        getSettings: function(){} 
      }
    };

    var allExercises = this.allExercises = function() {
      return Object.getOwnPropertyNames(exercisesData).map(function(key){
        return exercisesData[key];
      });
    }



    var keys = Object.keys(exercisesData);
    for ( var i in keys ) {
      var ex = exercisesData[keys[i]];
      sinon.stub(ex, "getSettings", function(){
        var r = [];
        ex.settings.forEach(function(s, index){
          r.push(settingsData[s]);
        });
        return Promise.resolve(r);
      });
    }

    var presentation = this.presentation = {
      "_id": "presentation-id-123",
      "title": "SamplePresentation",
      "owner": "owner-id-123",
      "originalFile": "samplePresentationRubrics.html",
      "asqFile": "samplePresentationRubrics.asq.dust",
      "asqFilePath": "f",
      "course": "General",
      setQuestionsPerSlide: function(){},
      setStatsPerSlide: function(){},
      save: sinon.stub().resolves(this),
      markModified: sinon.stub(),
      exercisesPerSlide: exercisesPerSlideData,
      'exercises': Object.keys(exercisesData)
    } 

    var status = this.status = true;

    var presentation_id = this.presentation_id = 'presentation-id-123';

    var then =  this.then = function(cb){
      return cb();
    };
    this.hooks = {doHook: sinon.stub().returns(Promise.resolve({
      html: '<html></html>',
      settings: '',
      id: '',
      status: true
    }))}


    //mock db
    var ObjectId = require('mongoose').Types.ObjectId
    this.db = {model: function(){}};

    this.exerciseModel = { 
      "create" : function(e){},
      "find": function(c){},
      "findById": function(x){},
      
    };
    this.slideshowModel = { 
      "create" : function(q){},
      "find": function(c){},
      "findById": function(x){}

    };

    this.settingModel = { 
      "create" : function(q){},
      "find": function(c){},
      "findById": function(x){}

    };

// -------------------------------------------------------

    sinon.stub(this.exerciseModel, "findById", function(x){

      return {
        exec: function(){
          return Promise.resolve(exercisesData[x]);
        }
      }
    });

    sinon.stub(this.exerciseModel, "find", function(x){

      return {
        exec: function(){
          return Promise.resolve(allExercises());
        }
      }
    });

    sinon.stub(this.slideshowModel, "findById", function(x){

      return {
        exec: function(){
          return Promise.resolve(presentation);
        }
      }
    });

      

    sinon.stub(this.db, "model")
    .withArgs("Slideshow").returns(this.slideshowModel)
    .withArgs("Exercise").returns(this.exerciseModel)
    .withArgs("Setting").returns(this.settingModel);

    this.fs = {
      readFile : function(){},
      writeFile : function(){},
    };
    sinon.stub(this.fs, "readFile").callsArgWith(2, null, "<html></html>");
    sinon.stub(this.fs, "writeFile").callsArgWith(2, null, "");

    var destination = this.destination = "../../";
    this.presentationSettings = SandboxedModule.require(modulePath, {
      requires: {
        'fs': this.fs,
        'lodash': require('lodash'),
        "../hooks/hooks.js" : this.hooks,
        "mongoose" : require('mongoose'),
      },

      globals : {
        db : this.db,
        app :{
          get: function(){
            return destination;
          }
        },
      }
    });

  }); 


//---------------------------------------------------------
  
  describe("getDustSettingsOfExercisesAll", function(){

    beforeEach(function(){
      this.slideshowModel.findById.reset();
      this.exerciseModel.findById.reset();

      var keys = Object.keys(this.exercisesData);
        for ( var i in keys ) {
          var ex = this.exercisesData[keys[i]];
          ex.getSettings.reset();
        }
    });

    it('should return correct data', function(done) {
      var correctReturnValue = [ 
        { 
          index: 'slide03', 
          exercises: [ 
            { 
              exerciseId: '5595a14e669d1d2a29eeb2a7',
              settings: [ 
                { 
                  key: 'maxNumSubmissions', 
                  value: 0, 
                  kind: 'number' 
                },
                { key: 'slideflow',
                  value: 'follow',
                  kind: 'select',
                  params: { 
                    options: ['self', 'follow', 'ghost'] 
                  } 
                } 
              ] 
            } 
          ] 
        },
        { 
          index: 'slide02', 
          exercises: [ 
            { 
              exerciseId: '5595a14e669d1d2a29eeb2a5',
              settings: [ 
                { 
                  key: 'maxNumSubmissions', 
                  value: 0, 
                  kind: 'number' 
                },
                { key: 'slideflow',
                  value: 'self',
                  kind: 'select',
                  params: { 
                    options: ['self', 'follow', 'ghost'] 
                  } 
                } 
              ] 
            } 
          ]  
        } 
      ];
      this.presentationSettings.getDustSettingsOfExercisesAll(this.presentation)
      .then(function(r) {
        sinon.assert.pass(r===correctReturnValue);
        done();
      }
      .bind(this))
      .catch(function(err) {
        done(err);
      });
    });

    it('should should call Slideshow.findById', function(done) {
      this.presentationSettings.getDustSettingsOfExercisesAll(this.presentation_id)
      .then(function() {
        this.slideshowModel.findById.calledOnce.should.equal(true);
        done();
      }
      .bind(this))
      .catch(function(err) {
        done(err);
      });
    });

    
  });


  describe("updateExerciseSettingsById", function(){

    beforeEach(function(){
      this.hooks.doHook.reset();
    });

    it('should call doHook() once', function(done) {
      var html = '<html></html>';
      var settings = '{}';
      var exercise_id = '1';
      this.presentationSettings.updateExerciseSettingsById(html, settings, exercise_id)
      .then(function(r) {
        this.hooks.doHook.calledOnce.should.equal(true);

        this.hooks.doHook.calledWith('udpate_exercise_settings', {
          exercise_id: exercise_id,
          settings: settings,
          html: html,
          status: false
        }).should.equal(true);

        done();
      }
      .bind(this))
      .catch(function(err) {
        done(err);
      });


    });
  });

  var status = true;
  describe("updateExerciseSettings", function(){

    before(function() {
      
      sinon.stub(this.presentationSettings, "updateExerciseSettingsById", function() {
        return Promise.resolve({
          status: status,
          html: '<html></html>'
        });
      });
    });

    beforeEach(function(){
      this.presentationSettings.updateExerciseSettingsById.reset();
      this.fs.readFile.reset();
      this.fs.writeFile.reset();
    });

    it('should call updateExerciseSettingsById() once ', function(done) {
      var settings = '{}';
      this.presentationSettings.updateExerciseSettings(settings, 1, 2)
      .then(function() {
        this.presentationSettings.updateExerciseSettingsById.calledOnce.should.equal(true);
        this.presentationSettings.updateExerciseSettingsById.calledWith('<html></html>', settings, 2).should.equal(true);
        done();
      }
      .bind(this))
      .catch(function(err) {
        done(err);
      });
    });

    it('should call readFile once ', function(done) {
      var settings = '{}';
      this.presentationSettings.updateExerciseSettings(settings, 1, 2)
      .then(function() {
        this.fs.readFile.calledOnce.should.equal(true);
        done();
      }
      .bind(this))
      .catch(function(err) {
        done(err);
      });
    });

    it('should call writeFile once ', function(done) {
      status = true;
      var settings = '{}';
      this.presentationSettings.updateExerciseSettings(settings, 1, 2)
      .then(function() {
        this.fs.writeFile.calledOnce.should.equal(true);
        done();
      }
      .bind(this))
      .catch(function(err) {
        done(err);
      });
    });

    it('should not call writeFile ', function(done) {
      status = false;
      var settings = '{}';
      this.presentationSettings.updateExerciseSettings(settings, 1, 2)
      .then(function() {
        this.fs.writeFile.called.should.equal(false);
        done();
      }
      .bind(this))
      .catch(function(err) {
        done(err);
      });
    });

  });


  describe("updateSlideshowSettings", function(){

    beforeEach(function(){
      this.presentationSettings.updateExerciseSettingsById.reset();
      this.fs.readFile.reset();
      this.fs.writeFile.reset();
      this.hooks.doHook.reset();
    });

    it('should call doHook() once ', function(done) {
      var slideshow_id = '0';
      var settings = [];
      this.presentationSettings.updateSlideshowSettings(settings, slideshow_id)
      .then(function() {
        this.hooks.doHook.calledOnce.should.equal(true);
        this.hooks.doHook.calledWith('update_slideshow_settings', {
          slideshow_id: slideshow_id,
          settings: settings,
          html: '<html></html>',
          status: false
        }).should.equal(true);
        done();
      }
      .bind(this))
      .catch(function(err) {
        done(err);
      });
    });



    it('should call readFile once ', function(done) {
      this.presentationSettings.updateSlideshowSettings([], 1)
      .then(function() {
        this.fs.readFile.calledOnce.should.equal(true);
        done();
      }
      .bind(this))
      .catch(function(err) {
        done(err);
      });
    });

    it('should call writeFile once ', function(done) {
      status = true;
      this.presentationSettings.updateSlideshowSettings([], 1)
      .then(function() {
        this.fs.writeFile.calledOnce.should.equal(true);
        done();
      }
      .bind(this))
      .catch(function(err) {
        done(err);
      });
    });

    it('should call updateExerciseSettingsById ', function(done) {

      this.presentationSettings.updateSlideshowSettings([], 1)
      .then(function() {
        this.presentationSettings.updateExerciseSettingsById.called.should.equal(true);
        this.presentationSettings.updateExerciseSettingsById.callCount.should.equal(this.presentation.exercises.length);
        done();
      }.bind(this))
      .catch(function(err) {
        done(err);
      });
    });
  });


});
