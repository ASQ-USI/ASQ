/**
 * @module lib/parse/parse
 * @description handles parsing presentations for exercises, questions, etc and
 * persisting this information to the db.
 **/

"use strict";

var microformat = require('asq-microformat')
  , Parser = microformat.parser
  , MarkupGenerator = microformat.generator
  , logger = require('../logger').appLogger
  , dust   = require('dustjs-linkedin')
  , Promise = require("bluebird")  
  , coroutine = Promise.coroutine
  , Slideshow = db.model('Slideshow')
  , Question = db.model('Question')
  , Exercise = db.model('Exercise')
  , Rubric = db.model('Rubric')
  , fs = require("fs")
  , path = require("path")
  , AsqElementsParser = require('./AsqElementsParser')

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
    console.log('-> persistParsedData');
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

  parseAndPersist: coroutine(function *parseAndPersist(slideshow_id){
    console.log('-> parseAndPersist');
    logger.debug('parsing main .html file for questions...');

    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    var destination = app.get('uploadDir') + '/' + slideshow_id;  
    var fPath = destination + '/' +  slideshow.originalFile;
    var slideShowFileHtml = yield fs.readFileAsync(fPath, 'utf-8');

    var parserResults  = (new Parser(logger)).parse(slideShowFileHtml, { wrap: false });

    if (parserResults.errors) {
      throw new Error(
        'Parsing failed with the following errors: \n - ' +
        parserResults.errors.join('\n - ')
      );
    }

    //update original file with any corrections from parser
    if("undefined" !== typeof parserResults.html && parserResults.html !==null){
      yield fs.writeFileAsync(fPath, parserResults.html);
    }  

    //persist exercises, questions, stats, rubrics
    var persistedData = yield this.persistParsedData(slideshow_id, parserResults);

    //generate presenter and viewer main files
    yield this.generateMainFileForRoles(slideshow_id, persistedData.exercises, persistedData.rubrics);

    return;
  }),

  parseAndPersistElems: coroutine(function *parseAndPersist(slideshow_id){
    console.log('-> parseAndPersistElems');
    logger.debug('parsing main .html file for questions...');

    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    var destination = app.get('uploadDir') + '/' + slideshow_id;  
    var fPath = destination + '/' +  slideshow.asqFile;
    var slideShowFileHtml = yield fs.readFileAsync(fPath, 'utf-8');

    var parser = new AsqElementsParser();

    var presentationConf = parser.getPresentationConf(slideShowFileHtml);
    var defaultConf = slideshow.configuration;
    var mixConf = function( lconf, gconf ) {
      for ( var g in gconf ) {
        if ( !lconf.hasOwnProperty(g) ) {
          lconf[g] = gconf[g];
        }
      }
      return lconf;
    }
    slideshow.configuration = mixConf(presentationConf, defaultConf);
    slideshow.markModified('configuration');
    yield slideshow.save();
    
    // Problem: syncronization
    // var option = {
    //   slides_id: slideshow_id,
    //   html: slideShowFileHtml
    // }
    // // fire `create_slideshow_conf` hook
    // yield parser.createSlidesConfiguration(option);
    console.log('test', slideshow.configuration);

    // var option = {
    //   slideshow_id: slideshow_id
    //   conf: slideshow.configuration,
    //   html: parsedHtml,
    // }
    // this will fire the `parse_html` hook
    var parsedHtml  = yield parser.parsePresentation(slideShowFileHtml);
    parsedHtml = parser.asqify(parsedHtml);
    

    var option = {
      slideshow_id: slideshow_id,
      conf: slideshow.configuration,
      html: parsedHtml,
    }
    parsedHtml = yield parser.createConfiguration(option);
    // console.log('hi', hi.conf);
    
    //update asq file with any corrections from parser
    yield fs.writeFileAsync(fPath, parsedHtml);

    var exPerSlide = parser.getExercisesPerSlide(parsedHtml, ".step", 'asq-exercise');
    slideshow.exercisesPerSlide = exPerSlide;
    slideshow.markModified('exercisesPerSlide');
    yield slideshow.save();

    return;
  }),

  generateMainFileForRoles: coroutine(
    function *generateMainFileForRoles(slideshow_id, exercises, rubrics){
    
    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    var destination = app.get('uploadDir') + '/' + slideshow_id;  
    var fPath = destination + '/' +  slideshow.originalFile;
    var slideShowFileHtml = yield fs.readFileAsync(fPath, 'utf-8');

    return Promise.map(["viewer", 'presenter'], function(role){
      return this.generateMainFileForRole(slideshow, slideShowFileHtml, role, exercises, rubrics);
    }.bind(this));
  }),

  generateMainFileForRole: coroutine(
    function *generateMainFileForRoleGen(slideshow, slideShowFileHtml, role, exercises, rubrics){
    console.log('-> generateMainFileForRole', role);
    if(role == null ) throw new Error("role must be defined");
      
    var newHtml = yield (new MarkupGenerator(dust)).render(slideShowFileHtml,
            exercises, rubrics, { userType : role })

    // TODO: maybe we shouldn't store the absolute path for the file
    var fPath = app.get('uploadDir') + '/' + slideshow._id;  
    var fileNoExt =  fPath + '/'
          + path.basename(slideshow.originalFile, '.html');
    slideshow[role + "File"] =  fileNoExt + '.asq-'+ role +'.dust';

    //save file and slideshow
    yield fs.writeFileAsync(slideshow[role + "File"], newHtml);
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
