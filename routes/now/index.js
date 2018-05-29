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
  res.sendFile(path.join(__dirname, '..', '..', '/public/question-editor/index.html'));
});

//when trying to get /now/* redirect to /now
router.get('/*', function(req, res) {
	res.redirect("/now");
});

module.exports = router;