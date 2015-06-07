/** @module routes/user/settings/handlers
    @description handlers for /:userid/settings
*/
'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var lib = require('../../../lib');
var logger = lib.logger.appLogger;
var usersSettings = require('../../../lib/settings/usersSettings');
var pluginsSettings = require('../../../lib/settings/pluginsSettings');

module.exports = {

  getSettings: function (req, res, next){
    res.redirect('settings/general')
  },

  getGeneralSettings: function (req, res, next) {
    res.render('generalSettings', {
      activeMenu: "general",
      username : req.user.username,
      user : {
        name : req.user.username,
        email : req.user.email
      }
    });
  },

  getUsersSettings: function (req, res, next) {
    try{
      var renderData = usersSettings.getUserSettings(req.user);

      logger.log({
        user_id: req.user._id,
      }, "got user settings");

      res.render('usersSettings', renderData);
    }catch(err){
      logger.error({
        err: err,
        user_id: req.user._id,
      }, "error getting users settings");

      next(err);
    }
  },

  getPluginsSettings: coroutine(function *getPluginsSettingsGen(req, res, next) {
    try{
      var renderData = yield pluginsSettings.getPluginsSettings();

      logger.log({
        user_id: req.user._id,
      }, "got user settings");

      res.render('pluginsSettings', renderData);
    }catch(err){
      logger.error({
        err: err,
        user_id: req.user._id,
      }, "error getting plugins settings");

      next(err);
    }
  }),

  postUserSettings: coroutine(function *postUserSettingsGen(req, res) {
    try{
      var formData = {};
      formData.firstname        = req.body.newfirstname;
      formData.lastname         = req.body.newlastname;
      formData.screenName       = formData.firstname + ' ' + formData.lastname;
      formData.email            = req.body.newemail.toLowerCase();
      formData.username         = req.body.newusername;
      formData.currentpassword  = req.body.currentpassword;
      formData.password         = req.body.newpassword;
      formData.passwordRepeat   = req.body.newpasswordconfirm;

      var renderData = yield usersSettings.updateUserSettings(req.user._id, formData);

      logger.log({
        user_id: req.user._id,
        formData: formData._id,
      }, "updated user settings");

      res.render('usersSettings', renderData);
    }catch(err){
       console.log(err.stack)
      logger.error({
        err: err,
        user_id: req.user._id,
        formData: formData._id,
      }, "error updating user settings");
    }
  })

}
