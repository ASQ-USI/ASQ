/**
 * @module lib/presentation/presentationThumbnails
 * @description logic to create presentations.
 **/

"use strict";

var Slideshow = db.model('Slideshow')
  , Promise = require("bluebird")
  , coroutine = Promise.coroutine;
 
module.exports = {

  setThumbnails: coroutine(function *setThumbnailsGen(presentation_id, thumbs){
    yield Slideshow.findByIdAndUpdate(presentation_id, {
      $set: { 
        thumbnails : thumbs,
        thumbnailsUpdated : Date.now()
      }
    }).exec();
  }),

  getThumbnails: coroutine(function *getThumbnailsGen(presentation_id){
    var s = yield Slideshow.findById(presentation_id).lean().exec();
    return s.thumbnails;
  }),

  setFontFaces: coroutine(function *setThumbnailsGen(presentation_id, fontFaces){
    yield Slideshow.findByIdAndUpdate(presentation_id, {
      $set: { 
        fontFaces : fontFaces
      }
    }).exec();
  }),

  getFontFaces: coroutine(function *getThumbnailsGen(presentation_id){
    var s = yield Slideshow.findById(presentation_id).lean().exec();
    return s.fontFaces;
  })
}