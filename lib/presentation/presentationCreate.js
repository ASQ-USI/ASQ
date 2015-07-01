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
      kind: 'number',

    });
    yield max.save();
    slideshow.settings.push(max);
    var slideflow = new Setting({
      key: 'slideflow',
      value: 'follow',
      kind: 'select',
      params: {
        options: ['self', 'follow', 'ghost']
      }, 
    });
    yield slideflow.save();
    slideshow.settings.push(slideflow);

    var assessment = new Setting({
      key: 'assessment',
      value: 'self',
      kind: 'select',
      params: {
        options: ['peer', 'auto', 'self']
      }, 
    });
    yield assessment.save();
    slideshow.settings.push(assessment);

    var example = new Setting({
      key: 'example',
      value: 2,
      kind: 'range',
      params: {
        min: 1,
        max: 5,
        step: 1
      }
    });
    yield example.save();
    slideshow.settings.push(example);

    yield slideshow.save();

    var booleanExample = new Setting({
      key: 'boolean',
      value: false,
      kind: 'boolean',
    });
    yield booleanExample.save();
    slideshow.settings.push(booleanExample);

    yield slideshow.save();

    yield User.findByIdAndUpdate(owner_id, {
      $push: { slides : slideshow._id }
    }).exec();

    return slideshow;
  })
}
