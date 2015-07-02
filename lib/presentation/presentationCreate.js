/**
 * @module lib/presentation/presentationCreate
 * @description logic to create presentations.
 **/

"use strict";

var Slideshow = db.model('Slideshow')
  , User = db.model('User')
  , Promise = require("bluebird")
  , coroutine = Promise.coroutine
  , settings = require('../settings').slidesSettings;

module.exports = {

  // TODO: when rendering the presentation there's no check
  // to see if the main presentation files exist
  createBlankSlideshow: coroutine(function *createBlankSlideshowGen(owner_id, name){
    var slideshow = yield Slideshow.create({
      title : name,
      owner : owner_id,
      settings : yield settings.getDefaultSettingsForNewPresentation()
    });


    yield User.findByIdAndUpdate(owner_id, {
      $push: { slides : slideshow._id }
    }).exec();

    return slideshow;
  })
}
