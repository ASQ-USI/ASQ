/** @module routes/user/handlers
    @description handlers for /user/:userid
*/
'use strict';

var when        = require('when');
var lib         = require('../../lib');
var appLogger   = lib.logger.appLogger;
var dustHelpers = lib.dustHelpers;
var Slideshow   = db.model('Slideshow');
var User        = db.model('User');
var Session     = db.model('Session');
var utils       = require('../../lib/utils/routes');
var getPresentationsByCourse = require('../../lib/courses/listPresentations').getPresentationsByCourse;


// GET /:user
function getUserPage(req, res) {
  appLogger.debug('user page');
  if (!req.isAuthenticated()) {
    res.send(200, 'Public user page of ' + req.routeOwner.username + '.');
  }
  else if (req.user.username === req.routeOwner.username) {

    getPresentationsByCourse(req.user._id, Session, Slideshow)
    .then(function(slidesByCourse){
      var type = utils.getAlertTypeClass(req);
       res.render('user', {
         username        : req.user.username,
         slidesByCourses : slidesByCourse,
         JSONIter        : dustHelpers.JSONIter,
         host            : ASQ.appHost,
         port            : app.get('port'),
         //id              : req.user.current,
         alert           : req.query.alert,
         type            : type,
         //session         : req.user.current
       });
    })
    .catch(function onError(err) {
      appLogger.error( err.toString(), { err: err.stack });
    });

  } else {
    res.send(200, 'Hello ' + req.user.username
        + '! You are viewing the user page of ' + req.routeOwner.username + '.');
  }
}

function getUserSettings(req, res) {
  res.render('settings', {
    username : req.user.username,
    user : {
      name : req.user.username,
      email : req.user.email
    }
  });
}

function updateUserSettings(req, res) {
  var username        = req.body.inputUsername;
  var email           = req.body.inputEmail;
  var password        = req.body.inputPassword;
  var passwordConfirm = req.body.inputRePassword;
  var strict          = false;

  // Checking input validity
  var errors = new Error('FIXME: Use the new validation module.');

  if (errors !== null) {
    res.render('settings', {
      username : req.user.username,
      alert : errors.toString(),
      type  : 'error'
    }); //TODO handle errors display on page
  }

  // Checking user name uniqueness
  //Check if username already exists
  User.findOne({ username : username }, function(err, user) {
    if (user) {
      return res.render('settings', {
        username : req.user.username,
        message : 'Username already taken'
      });
    }
  });

  // Select fields to update
  var newValues = {};
  if(username.length > 0){
    newValues.name = username;
  }
  if(password.length > 0){
    newValues.password = password;
  }
  if(email.length > 0){
    newValues.email = email;
  }

  //update user
  var user = req.user;
  user.set(newValues);
  user.save(function(err, user) {
    if (err) res.render('settings', {
      username : req.user.username,
      user: newValues,
      alert: 'Something went wrong. Your data was not saved.',
      type: 'error'
    });
    res.render('settings', {
      username : req.user.username,
      user:  newValues,
      alert: 'Account successfully updated!',
      type: 'success'
    });
  });
}

function getLivePresentations(req, res) {
  var slideshowSessionMap = {};
  Session.getLiveSessions(req.routeOwner._id)
  .then(
    function(sessions){
      var sessionIds = sessions.map(function getSessionIds(session){
        slideshowSessionMap[session.slides] = session._id
        return session.slides
      })
        return Slideshow.find({_id : {$in : sessionIds}}).exec();
    })
  .then(
    function(slideshows){
      slideshows.forEach(function(slideshow){
        slideshow.liveUrl = ASQ.rootUrl + '/' + req.routeOwner.username
                      + '/presentations/' + slideshow._id + '/live/'
                      + slideshowSessionMap[slideshow._id]
                      + '/?role=viewer&view=presentation';
      })

      res.render('userLive', {
      livePresentations: slideshows,
      username: req.routeOwner.username,
      owner : {name: req.routeOwner.username },
      user : { name : req.params.name, email : req.params.name }
      });
    })
  .then(null,
    function(err){
      var where = "@ getLivePresentations";
      err = err instanceof Error ? err : new Error(err);
      appLogger.error(where + ': ', { error: err.stack });
      res.render('500', { where: where , error: err, stack: err.stack });
    });
}

module.exports = {
  getUserPage        : getUserPage,
  getUserSettings    : getUserSettings,
  updateUserSettings : updateUserSettings,
  getLivePresentations : getLivePresentations
}
