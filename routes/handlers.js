var _                = require('lodash')
, when               = require('when')
, lib                = require('../lib')
, signupFormMessages = require('../lib/forms/signupFormMessages')
, validation         = require('../shared/validation')
, appLogger          = require('../lib/logger').appLogger
, User               = db.model('User');

function getHomePage(req, res) {
  if (req.isAuthenticated()) {
    //redirect to user homepage
    res.redirect('/' + req.user.username);
  } else{
    //render asq homepage
    res.render('landingPage');
  }
}

function getSignup(req, res) {
  //TODO Code a real signup page.
  res.render('signup', {
    tipMessages : require('../lib/forms/signupFormMessages')
  });
}

function postSignup(req, res, next) {
  var data = {};
  data.firstname      = req.body.signupfirstname;
  data.lastname       = req.body.signuplastname;
  data.screenName     = data.firstname + ' ' + data.lastname;
  data.email          = req.body.signupemail.toLowerCase();
  data.username       = req.body.signupusername;
  data.password       = req.body.signuppassword;
  data.passwordRepeat = req.body.signuppasswordconfirm;

  var errs = validation.getErrorsSignUp(data);

  errEmail = (!!errs.email) 
    ? true 
    : User.count({ email: data.email, _type: 'User' }).exec();

  errUsername = (!!errs.username) 
    ? true 
    : User.count({ username: data.username, _type: 'User' }).exec();

  when.join(errEmail, errUsername)
  .then(
    function onDbCheck(dbErrs) {
      if (!errs.email) {
        errs.email = dbErrs[0] === 0 ? null : 'taken';
      }
      if (!errs.username) {
        errs.username = dbErrs[1] === 0 ? null : 'taken';
      }
      for (var err in errs) {
        if (!! errs[err]) {
          return when.reject(errs);
        }
      }
      var newUser = new User(data);
      var deferred = when.defer();
      newUser.save(function(err, savedUser) {
        if (err) {
          throw err;
        } else {
          deferred.resolve(savedUser);
        }
      });
      return deferred.promise;
  }).then(
    function onNewUser(user) {
      appLogger.info('New user registered: %s (%s)', user.username, user.email);
      req.login(user, function onLogin(err) {
        if (err) {
          var error = new Error('User created but login failed with: ' +
            err.toString());
          throw error;
        }
        res.redirect('/' + user.username +
          '/?alert=Registration%20Succesful&type=success');
      });
  }).then(null,
    function onError(err) {
      if (err instanceof Error) {
        appLogger.error('During sign up: ' + err.toString(), { err: err.stack });
        next(err);
      } else {
        for (var key in err) {
          if (err[key] == null) {
            err[key] = 'ok';
          }
        }
        res.render('signup', {
        tipMessages : signupFormMessages,
        activate : err,
        data : data
      });
      }
    });
}

function getSignupCampus(req, res, next) {
  var username = req.flash('username');
  User.count({ username: username, _type: 'User' }).exec()
  .then(
    function onCount(count) {
      var activate = {};
      var asqUsername = null;
      if (count === 0) {
        asqUsername = username;
        activate.username = 'ok';        
      }
      res.render('signupCampus', {
        tipMessages : require('../lib/forms/signupCampusFormMessages'),
        info : req.flash("info"),
        error : req.flash("error"),
        campusUsername : username,
        asqUsername : asqUsername,
        activate : activate
      });
  });
}

function postSignupCampus(req, res) {
}

function getLogin(req, res) {
  res.render('login', {
      formSignup : false,
      alert: req.flash()
    });
}

function postLogin(req, res) {
  console.log('I made it')
  var redirect_to = req.session.redirect_to 
    ? req.session.redirect_to
    : '/' + req.user.username + '/' ;
  res.redirect(redirect_to);
}

function getLoginCampus(req, res) {
  var alert ={}
    , error = req.flash('error')

  if("undefined" != typeof error){
    alert.error = error
  }
  
  res.render('loginCampus', {
      formSignup : false,
      alert: alert
    });
}

function postLoginCampus(req, res) {
  var redirect_to = req.session.redirect_to 
    ? req.session.redirect_to
    : '/' + req.user.username + '/' ;
  res.redirect(redirect_to);
}

function logout(req, res) {
  appLogger.debug('logout');
  req.logout();
  res.redirect('/');
}

function getUploadForm(req, res) {
  res.render('upload', { username: req.user.username });
}

function emailAvailable(req, res, next) {
  if (req.accepts('json', 'text', 'application/json') == undefined) {
    var err = Error.create().http(406, 'Only accepts json.', { type: 'not_acceptable_error' });
    next(err);
    return;
  }
  var response = {};
  response.err = null;
  response.msg = null;
  response.username = null;
  var email = !! req.query.email 
    ? req.query.email.trim() 
    : null;
    
  var username = null;
  var err = validation.getErrorEmail(email);
  var promise = null;
  if (!! err) {
    response.err = err;
    response.msg = signupFormMessages.email.error[err];
    res.json(response); // Invalid email
    return;
  }
  User.count({ email : email, _type: 'User' }).exec()
  .then( 
    function onEmail(count) {
      if (count !== 0) {
        response.err = 'taken';
        response.msg = signupFormMessages.email.error.taken;
        res.json(response); // Taken email
        return null;
      }
      response.msg = signupFormMessages.email.isaok.ok;
      username = email.match(/^([^@]*)@/)[1];
      var userErr = validation.getErrorUsername(username);
      if (!! err) {
        res.json(response); // Blank or Invalid username
        return null;
      }
      return User.count({ username: username, _type: 'User' }).exec();
  }).then(
    function onUser(count) {
      if (count !== 0) {
        res.json(response); // Taken username
      } else {
        response.username = username;
        res.json(response);
      }
  }).then(null,
    function onError(err) {
      appLogger.error('Error during email availability check: ' +
        err.toString(), { err: err.stack });
      response.msg = 'Error during email availability check: ' + err.toString();
      res.json(500, response);
  });
}

function usernameAvailable(req, res) {
  if (req.accepts('json', 'text', 'application/json') == undefined) {
    var err = Error.create().http(406, 'Only accepts json.', { type: 'not_acceptable_error' });
    next(err);
    return;
  }
  var response = {};
  response.err = null;
  response.msg = null;
  var username = !! req.query.username ? req.query.username.trim() : null;
  var err = validation.getErrorUsername(username);
  console.log('%s -> %s', username, err);
  if (!! err) {
    response.err = err;
    response.msg = signupFormMessages.username.error[err];
    res.json(response); // Blank or Invalid username (or taken for reserved routes)
    return;
  }
  User.count({ username : username, _type : 'User' }).exec()
  .then(
    function onUser(count) {
      if (count !== 0) {
        response.err = 'taken';
        response.msg = signupFormMessages.username.taken;
        res.json(response); // Taken username
      } else {
        response.msg = signupFormMessages.username.isaok.ok;
        res.json(response);
      }
  }).then(null,
    function onError(err) {
      appLogger.error('Error during user availability check: ' +
        err.toString(), { err: err.stack });
      response.msg = 'Error during user availability check: ' + err.toString();
      res.json(500, response);
  });
}

module.exports = {
  getHomePage       : getHomePage,
  getSignup         : getSignup,
  postSignup        : postSignup,
  getSignupCampus   : getSignupCampus,
  postSignupCampus  : postSignupCampus,
  getLogin          : getLogin,
  postLogin         : postLogin,
  getLoginCampus  : getLoginCampus,
  postLoginCampus : postLoginCampus,
  logout            : logout,
  getUploadForm     : getUploadForm,
  emailAvailable    : emailAvailable,
  usernameAvailable : usernameAvailable
}
