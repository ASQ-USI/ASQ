/**
 * @module lib/presentation/presentationDelete
 * @description logic to delete presentations and/or their assets.
 **/

"use strict";

var Slideshow = db.model('Slideshow')
  , User = db.model('User')
  , Promise = require('bluebird')
  , coroutine = Promise.coroutine
  , assert = require('assert')
  , _ = require('lodash')
  , rimraf = require('rimraf');

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
      "Question": slideshow.removeQuestions.bind(slideshow)
    }

    //remove the model names in `assetsToPreserve` from promises and convert to Array
    var promisesAr = _.values( _.omit(promises, assetsToPreserve))

    yield Promise.all(promisesAr.map(function(fn){return fn()}));

    return;
  }),

  removeFileAssets: coroutine(
  function *removePresentationFileAssetsGen(slideshow_id){
    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    var presentationDir = app.get('uploadDir') + '/' + slideshow._id

    yield Promise.promisify(rimraf)(presentationDir)
    
    return;
  })

}