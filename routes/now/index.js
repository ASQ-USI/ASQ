/** @module routes/now
    @description routes for /now
*/

'use strict';
var logger        = require('logger-asq');
var router = require('express').Router();

logger.debug('Setting now routes');

 //Hello
 router.get('/', function(req, res) {
 	res.send('Hello World!');
 });

 module.exports = router;
