/** @module lib/settings/usersSettings
    @description settings logic for users
*/
'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var validation = require('../../shared/validation');
var userUpdateMessages = require('../forms/userSettings/messages');
var User = db.model('User');

module.exports = {
  getUserSettings : function (user){
    return {
      activeMenu: "users",
      tipMessages: userUpdateMessages,
      user : user.toObject()
    }
  },

  updateUserSettings: coroutine(function *updateUserSettingsGen(user_id, formData){

    var errs = validation.getErrorsSignup(formData);

    if(! errs.email){
     errs.email =  yield User.count({
       email: formData.email,
       _id : {$ne : user_id},
      _type: 'User' 
      }).exec();

     errs.email = errs.email === 0 
      ? null 
      : 'taken';
    }

    if(! errs.username){
     errs.username =  yield User.count({
       username: formData.username,
       _id : {$ne : user_id},
      _type: 'User' 
      }).exec();

     errs.username = errs.username === 0 
      ? null 
      : 'taken';
    }

    for (var err in errs) {
      if (errs.hasOwnProperty(err) && (!! errs[err])) {
        var userdata = yield User.findById(user_id).exec();
        return {
          alert: 'There were some errors. Please see the suggestions below',
          type: 'danger',
          user: userdata,
          tipMessages : userUpdateMessages,
          activate : errs,
          formData : formData
        }
      }
    }

    //get user
    var user = yield User.findById(user_id).exec();

    //check password
    var isValidPasswordFn = Promise.promisify(user.isValidPassword.bind(user));
    var isValidPassword = yield isValidPasswordFn(formData.currentpassword);

    if (!isValidPassword) {
      var userdata = yield User.findById(user_id).exec();
      return {
        alert: 'Wrong current password',
        type: 'danger',
        user: userdata,
        formData : formData
      }
    }

    //update user
    user.firstname   = formData.firstname;
    user.lastname    = formData.lastname;
    user.screenName  = formData.screenName;
    user.email       = formData.email;
    user.username    = formData.username;
    user.password    = formData.password;

    yield user.save();

    return {
      user:  user,
      alert: 'Account successfully updated!',
      type: 'success'
    }
  })
}