/** @module routes/now
    @description routes for /now
    */

'use strict';
var logger        = require('logger-asq');
var path    = require("path");
var router = require('express').Router();
var fs = require('fs');
var now = require('../../lib/now/now');
var Slideshow = require('../../models/slideshow');

logger.debug('Setting now routes');

router.get('/', function(req, res) {
	// res.render('../public/question-editor/build/es6-bundled/app/index.html', {
	// 	serveDir              : 'question-editor/.transpiled/',
	// 	host                  : req.app.locals.urlHost,
	// 	port                  : req.app.locals.urlPort
	// });
	res.sendFile(path.join(__dirname, '..', '..', '/public/question-editor/index.html'));
});

router.post('/', async function(req, res) {

	// exercise coming from qea-editor: req.body.exercise

  try {
    let owner_id = req.user._id;
    let exercise = req.body.exercise;
    const slideshowid = await now.createPresentationFromNowHtml(owner_id, 'nowquiz', exercise);
    const slideshow = Slideshow.findById(slideshowid).lean().exec();

    logger.log({
      owner_id: req.user._id,
      slideshow: slideshow._id,
      exercise: exercise
    }, "uploaded new now quiz");

    res.redirect(303, ['/', req.user.username, '/presentations/?alert=',
      slideshow.title, ' uploaded successfully!&type=success']
      .join(''));

  } catch(err){
    console.log(err.stack);
    logger.error({
      err: err,
      owner_id: req.user._id,
      exercise: exercise
    }, "error uploading now quiz");
  }
});

module.exports = router;