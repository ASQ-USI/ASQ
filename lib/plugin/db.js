/** @module lib/plugin/db
    @description db interface for plugins
*/

'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;

module.exports = {
  model : db.model.bind(db),

  getPresentationQuestionsByType: coroutine(function *getPresentationQuestionsByTypeGen(presentation_id, type){
    if(!type || (''+type).trim().length < 0) throw new Error('Second arg should be a non-empty string');
    
    var presentation = yield db.model('Slideshow').findById(presentation_id).exec();

    if (!presentation) throw new Error('Presentation with _id: ' + presentation_id.toString() +' does not exist');
    if (presentation.questions.length == 0) return [];

    var questions = yield db.model('Question').find({
      _id : {$in: presentation.questions },
      type : type
    }).lean();

    return questions;
  })
}