/**
 * @module lib/presentation/presentationDelete
 * @description logic to delete presentations and/or their assets.
 **/

"use strict";

var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var path = require('path');
var assert = require('assert');
var _ = require('lodash');
var rimraf = require('rimraf');
var User = db.model('User');
var Slideshow = db.model('Slideshow');

module.exports = {

  // TODO: when rendering the presentation there's no check
  // to see if the main presentation files exist
  removeDbAssets: coroutine(
  function *removePresentationDBAssetsGen(slideshow_id, assetsToPreserve){
    assetsToPreserve = assetsToPreserve || [];
    assert(_.isArray(assetsToPreserve), 'assetsToPreserve should be an array')

    var slideshow = yield Slideshow.findById(slideshow_id).exec();

    var promises = {
      "Session": slideshow.removeSessions.bind(slideshow),
      "Questions": slideshow.removeQuestions.bind(slideshow),
      "Exercises": slideshow.removeExercises.bind(slideshow)
    }

    //remove the model names in `assetsToPreserve` from promises and convert to Array
    var promisesAr = _.values( _.omit(promises, assetsToPreserve))

    yield Promise.all(promisesAr.map(function(fn){return fn()}));

    return;
  }),

  removeFileAssets: coroutine(
  function *removePresentationFileAssetsGen(slideshow_id){
    var slideshow = yield Slideshow.findById(slideshow_id).exec();

    yield Promise.promisify(rimraf)(slideshow.path)
    
    return;
  })

}