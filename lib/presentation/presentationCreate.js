/**
 * @module lib/presentation/presentationCreate
 * @description logic to create presentations.
 **/

"use strict";

var Slideshow = db.model('Slideshow')
  , Setting = db.model('Setting')
  , User = db.model('User')
  , Promise = require("bluebird")
  , coroutine = Promise.coroutine;

module.exports = {

  // TODO: when rendering the presentation there's no check
  // to see if the main presentation files exist
  createBlankSlideshow: coroutine(function *createBlankSlideshowGen(owner_id, name){
    var slideshow = yield Slideshow.create({
      title : name,
      owner : owner_id
    });

    // Add Default Settings
    var max = new Setting({
      key: 'maxNumSubmissions',
      value: 0,
      type: 'Number'
    });
    yield max.save();
    slideshow.settings.push(max);
    var slideflow = new Setting({
      key: 'slideflow',
      value: 'follow',
      type: 'String',
      enumerate: true,
      options: ['self', 'follow', 'ghost'],
    });
    yield slideflow.save();
    slideshow.settings.push(slideflow);
    var assessment = new Setting({
      key: 'assessment',
      value: 'peer',
      type: 'String',
      enumerate: true,
      options: ['peer', 'self', 'auto'],
    });
    yield assessment.save();
    slideshow.settings.push(assessment);

    yield slideshow.save();

    yield User.findByIdAndUpdate(owner_id, {
      $push: { slides : slideshow._id }
    }).exec();

    return slideshow;
  })
}
