/** 
  * @module routes/user/settings/index
  * @description routes for /:userid/settings
*/
'use strict';

var router = require('express').Router();
var handlers = require('./handlers');
var lib = require('../../../lib');
var logger = lib.logger.appLogger;

logger.debug('Setting settings routes');

router.get('/', handlers.getSettings);

//Render the general settings
router.get('/general', handlers.getGeneralSettings);

//Render the users settings
router.get('/users', handlers.getUsersSettings);

//Render the plugins settings
router.get('/plugins', handlers.getPluginsSettings);

//Update the user settings
router.post('/users', handlers.postUserSettings);

module.exports = router;