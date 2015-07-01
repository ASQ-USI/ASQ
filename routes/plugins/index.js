/** @module routes/plugin/index
    @description routes for /:userid
*/
'use strict';

var router = require('express').Router();
var middleware = require('../../lib/middleware/middleware');
var handlers = require('./handlers');
var logger   = require('logger-asq');

logger.debug('Setting plugin routes');

router.post('/:pluginName/activate', middleware.isAuthenticated, 
  handlers.postActivate);

router.delete('/:pluginName/activate', middleware.isAuthenticated, 
  handlers.deleteActivate);

router.post('/:pluginName/install', middleware.isAuthenticated, 
  handlers.postInstall);

module.exports = router;