/** @module routes/now
    @description routes for /now
    */

'use strict';
var logger        = require('logger-asq');
var path    = require("path");
var router = require('express').Router();

logger.debug('Setting now routes');

router.get('/', function(req, res) {
	// res.render('../public/question-editor/build/es6-bundled/app/index.html', {
	// 	serveDir              : 'question-editor/.transpiled/',
	// 	host                  : req.app.locals.urlHost,
	// 	port                  : req.app.locals.urlPort
	// });
	res.sendFile(path.join(__dirname, '..', '..', '/public/question-editor/build/es6-unbundled/index.html'));
});

module.exports = router;