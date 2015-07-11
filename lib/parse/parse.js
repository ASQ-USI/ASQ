/**
 * @module lib/parse/parse
 * @description handles parsing presentations for exercises, questions, etc and
 * persisting this information to the db.
 **/

"use strict";

var logger  = require('logger-asq');
var dust   = require('dustjs-linkedin');
var Promise = require("bluebird")  ;
var coroutine = Promise.coroutine;
var Slideshow = db.model('Slideshow');
var Question = db.model('Question');
var Exercise = db.model('Exercise');
var Rubric = db.model('Rubric');
var fs = require("fs");
var AsqElementsParser = require('./AsqElementsParser');
var _ = require('lodash').runInContext();
var presentationSettings = require('../settings').presentationSettings;
var plugin = require('../plugin/');

Promise.promisifyAll(fs);

module.exports = {

  persistQuestionsForExercice : coroutine(function *persistQuestionsForExerciceGen(questionIdsMap, exercise) {
    var createdQuestions = yield Promise.map(exercise.questions, function(q){
      return Question.create(q);
    }) ;

    exercise.questions.forEach(function(q, i) {
      //add db ids
      q.id = createdQuestions[i].id
      q._id = createdQuestions[i]._id
      //map question html ids to database id
      questionIdsMap[q.htmlId] = createdQuestions[i].id;
    });

    var newExercise = yield Exercise.create({
      assessmentTypes : exercise.assessmentTypes,
      questions       : createdQuestions.map(function(q) {
        return q._id;
      })
    });

    exercise.id = newExercise.id;

    return createdQuestions;
  }),

  persistParsedData: coroutine(function *persistParsedDataGen(slideshow_id, parseData){

    var parsedExercises = parseData.exercises
      , questionIdsMap = {} //To map html id to object ids of questions
      , parsedQuestions = []
      , parsedStats = parseData.stats
      , parsedRubrics = parseData.rubrics;

    //pass map and at every invocation
    var bindedPersistQFE = this.persistQuestionsForExercice.bind(this, questionIdsMap);

    //create questions and exercises
    yield Promise.map(parsedExercises, bindedPersistQFE);

    parsedExercises.forEach(function(exercise) {
      parsedQuestions = parsedQuestions.concat(exercise.questions);
    });

    parsedStats = this.getStatsWithQuestionIds(questionIdsMap, parsedStats);
    parsedRubrics = this.getRubricsWithQuestionIds(questionIdsMap, parsedRubrics);

    //persist rubrics
    var rubrics = yield Rubric.create(parsedRubrics);

    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    slideshow.questions = parsedQuestions;
    slideshow.setQuestionsPerSlide(parsedQuestions);
    slideshow.setStatsPerSlide(parsedStats);
    yield slideshow.save();

    //questions and rubrics and rubrics have objectIds now;
    return {
      exercises: parsedExercises,
      rubrics: rubrics
    }

  }),

  parseAndPersist: coroutine(function *parseAndPersistGen(slideshow_id){

    logger.debug('parsing main .html file for questions...');

    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    var fPath = slideshow.asqFilePath;
    var slideShowFileHtml = yield fs.readFileAsync(fPath, 'utf-8');

    var pNames = yield plugin.getPluginNamesByType();
    var parser = new AsqElementsParser(pNames.element, pNames.question);

    // This will fire `parse_presentation_settings` hook.
    // Call this before `parse_html` bacause we need presentatino level
    // settings for creating exercise's settings.
    yield parser.parsePresentationSettings({
      html: slideShowFileHtml,
      slideshow_id: slideshow_id
    });


    // this will fire the `parse_html` hook
    var r  = yield parser.parsePresentation({
      html: slideShowFileHtml,
      slideshow_id: slideshow_id
    });
    var parsedHtml = r.html;
    parsedHtml = parser.asqify(parsedHtml);


    //update asq file with any corrections from parser
    yield fs.writeFileAsync(fPath, parsedHtml);


    var exPerSlide = parser.getExercisesPerSlide(parsedHtml, ".step", 'asq-exercise');
    slideshow.exercisesPerSlide = exPerSlide;
    slideshow.markModified('exercisesPerSlide');

    var exercises = parser.getExercises(parsedHtml, 'asq-exercise');

    // check how many of the exercises in HTML made it to the db
    var exercisesInDb = yield Exercise.find({_id : {$in: exercises}}, {_id: 1}).exec();
    slideshow.exercises = exercisesInDb.map(function(e){return e._id});

    var qPerSlide = parser.getQuestionsPerSlide(parsedHtml, ".step");

    slideshow.questionsPerSlide = qPerSlide;
    slideshow.markModified('questionsPerSlide');

    var questions = parser.getQuestions(parsedHtml);

    // check how many of the questions in HTML made it to the db
    var questionsInDb = yield Question.find({_id : {$in: questions}}, {_id: 1}).exec();
    slideshow.questions = questionsInDb.map(function(q){return q._id});

    yield slideshow.save();

    return;
  }),

  getStatsWithQuestionIds: function (questionIdsMap, stats){
    for (var i = 0, l = stats.length; i < l; i++) {
      var htmlId = stats[i].questionHtmlId;
        if (! questionIdsMap.hasOwnProperty(htmlId)) {
          throw (new Error([
            'Invalid question Id reference "', htmlId,
            '" for stats on slide "', stats[i].slideHtmlId, '".'
          ].join('')));
        }
      stats[i].questionId = questionIdsMap[htmlId];
    };

    return stats;
  },

  getRubricsWithQuestionIds: function (questionIdsMap, rubrics){
    for (var i = 0, l = rubrics.length; i < l; i++) {
      var qId = rubrics[i].question;
      if (! questionIdsMap.hasOwnProperty(qId)) {
        return Promise.reject(new Error([
          'Invalid question Id reference "', qId,
          '" for rubrics on slide "', rubrics[i].stemText, '".'
        ].join('')));
      }
      rubrics[i].question = questionIdsMap[qId];
    };
    return rubrics;
  },

  replaceAll: function(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
  },

  escapeDustBrackets: function(str){
    str = this.replaceAll('{','ESCAPEFORDUSTBRACKETSASQ',str);
    str = this.replaceAll('}','{~rb}',str);
    return this.replaceAll('ESCAPEFORDUSTBRACKETSASQ','{~lb}',str);
  }
}
