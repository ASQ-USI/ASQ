'use strict';

var logger  = require('logger-asq');
const _ = require('lodash');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const fs = Promise.promisifyAll(require('fs'));
const ligaturesReg = require('./ligaturesRegexes');
const config = require('../../config');
const Question = db.model('Question');


module.exports = {
  getQuestionsToInjectFromDb: coroutine(function *getQuestionsToInjectFromDbGen(qIds){
    
    const questions = yield Question
      .find({_id : {$in: qIds}}, {'data.html' : 1})
      .lean()
      .exec();

    if(questions.length < qIds.length ){
      const dbQObjectIds = questions.map( (q) => q._id.toString() );
      const diff = _.difference(qIds, dbQObjectIds);
      const msg = `The following question ids were not found in the database: ${diff.toString()}`;
      throw new Error(msg);
    }

    // if we want to inject a question, it needs to have a data.html prop
    questions.forEach( (q) => {
      if(!q.data || ! q.data.html){
        throw new Error(`Question ${q._id.toString()} has no data.html property`)
      }
      q.data.html = q.data.html.replace(/\s?uid=["'][a-zA-Z0-9]{24}["']/g, "");
    })

    // create hash to make injection easier
    const qHash = _.keyBy(questions, function(q) {
      return q._id.toString();
    });

    return qHash;
  }),

  injectQuestionsToHtml: coroutine(function * injectQuestionsToHtmlGen(html){
    logger.debug('injecting questions...');

    const $ = cheerio.load(html, {
      decodeEntities: false,
      lowerCaseAttributeNames: false,
      lowerCaseTags: false,
      recognizeSelfClosing: true,
    });


    // we only resolve from this server
    const asqServer = config.rootUrl.replace(config.urlProtocol, 'asq')
    const regex = new RegExp(`${asqServer}\\/questions\\/([0-9a-fA-F]{24})`, 'gi');
    let bodyTxt = $('body').text().replace(/\s/g, '').toLowerCase();

    // Replace ligatures with double letters
    ligaturesReg.forEach(lr => {
      bodyTxt = bodyTxt.replace(lr.reg, lr.value);
    });

    const qObjectIds = [];
    let matches;
    
    while ((matches = regex.exec(bodyTxt)) !== null) {
      qObjectIds.push(matches[1])
    }


    if(qObjectIds.length === 0) return html;

    // append style for slides that contain ASQ questions
    $('head').append(`\n
      <style>
        .injected-question{
          min-width: 90vw;
          min-height: 90vh;
        }
      </style>`);

    const qHash = yield this.getQuestionsToInjectFromDb(qObjectIds);

    $('.step').each(function replaceQuestion(i, elem) {
      const cheerioElem = $(elem);
      const elText = $(elem).text().replace(/\s/g, '');
      let newHtml = '<asq-exercise>'
      while ((matches = regex.exec(elText)) !== null) {
        newHtml += `\n\t ${qHash[matches[1]].data.html}`;
      }

      if(newHtml === '<asq-exercise>') return; // there was no question

      newHtml += '\n</asq-exercise>';
      $(elem).html(newHtml);

      // slides with ASQ question should have their own style 
      $(elem).addClass('injected-question');
    });

    return $.html();
  })
}