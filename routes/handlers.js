const _ = require('lodash');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const logger = require('logger-asq');
const signupMessages = require('../lib/forms/signup/messages');
const completeRegistrationMessages = require('../lib/forms/completeRegistration/messages');
const validation = require('../shared/validation');
const User       = db.model('User');
const GuestUser  = db.model('GuestUser');
const utils      = require('../lib/utils/routes');

function getHomePage(req, res) {
  if (req.isAuthenticated()) {
    if(! req.user.regComplete){
      return res.redirect('/complete-registration');
    }
    //redirect to user homepage
    res.redirect('/' + req.user.username);
  } else{
    //render asq homepage
    res.render('landingPage');
  }
}

function getCompleteRegistration(req, res, next) {
  const username = req.user.ldap.cn ||  req.flash('username') ;
  if('undefined' == typeof username || username.length ==0){
    res.render('completeRegistration', {
      tipMessages : completeRegistrationMessages,
      info : req.flash('info'),
      error : req.flash('error'),
    });
  }else{
    User.count({ username: username, _type: 'User' }).exec()
    .then(
      function onCount(count) {
        const activate = {};
        let asqUsername = null;
        if (count === 0 && username) {
          asqUsername = username;
          activate.username = 'ok';
        }
        res.render('completeRegistration', {
          tipMessages : completeRegistrationMessages,
          info : req.flash('info'),
          error : req.flash('error'),
          asqUsername : asqUsername,
          activate : activate
        });
    });
  }

}

function postCompleteRegistration(req, res) {
  const data ={
    username : req.body.signupusername
  }

  const errs = validation.getErrorsSignupCampus(data);

  errUsername = (!!errs.username)
    ? Promise.resolve(true)
    : User.count({ username: data.username, _type: 'User' }).exec();

  errUsername.then(
    function onDbCheck(err) {
      if (!errs.username) {
        errs.username = err === 0 ? null : 'taken';
      }
      for (var err in errs) {
        if (!! errs[err]) {
          return Promise.reject(errs);
        }
      }

      //register new user
      req.user.username = data.username;
      req.user.regComplete = true;

      return req.user.save();
  }).then(
    function onNewUser(user) {
      logger.info('Ldap user registration completed: %s (%s)', user.username, user.ldap.cn);
      res.redirect(utils.getPreviousURLOrHome(req));

  }).then(null,
    function onError(err) {
      if (err instanceof Error) {
        logger.error('On complete registration: ' + err.toString(), { err: err.stack });
        next(err);
      } else {

        var keys = Object.keys(err)
        for (var i=0; i<keys.length; i++) {
          if (err[keys[i]] == null) {
            err[keys[i]] = 'ok';
          }
        }
        res.render('completeRegistration', {
          tipMessages : completeRegistrationMessages,
          activate : err,
          data : data
        });
      }
    });
}

function getSignup(req, res) {
  res.render('signup', {
    tipMessages : signupMessages
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

  var errs = validation.getErrorsSignup(data);

  errEmail = (!!errs.email)
    ? true
    : User.count({ email: data.email, _type: 'User' }).exec();

  errUsername = (!!errs.username)
    ? true
    : User.count({ username: data.username, _type: 'User' }).exec();

  Promise.join(errEmail, errUsername)
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
          return Promise.reject(errs);
        }
      }

      var newUser = new User(data);
      //users from main form give all the information we need
      newUser.regComplete = true;

      return newUser.save();
  }).then(
    function onNewUser(user) {
      logger.info('New user registered: %s (%s)', user.username, user.email);
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
        logger.error('During sign up: ' + err.toString(), { err: err.stack });
        next(err);
      } else {
        for (var key in err) {
          if (err[key] == null) {
            err[key] = 'ok';
          }
        }
        res.render('signup', {
        tipMessages : signupMessages,
        activate : err,
        data : data
      });
      }
    });
}

function getLogin(req, res) {

  res.render('login', {
      formSignup : false,
      alert: req.flash()
    });
}

function postLogin(req, res) {
  if(req.body.rememberMe){
    req.session.cookie.maxAge = 2592000000 //30 days
  }
  
  res.redirect(utils.getPreviousURLOrHome(req));
}

function getLoginCampus(req, res) {
  var alert ={}
    , error = req.flash('error')

  if('undefined' != typeof error){
    alert.error = error
  }

  res.render('loginCampus', {
      formSignup : false,
      alert: alert
    });
}

function postLoginCampus(req, res) {
  res.redirect(utils.getPreviousURLOrHome(req));
}

function logout(req, res) {
  logger.debug('logout');
  req.logout();
  res.redirect('/');
}

function getUploadForm(req, res) {
  var cookie = decodeURIComponent(req.headers.cookie).match(/asq\.sid=\S+/);
  var rendObj = {
    username : req.user.username,
    user : {
      name : req.user.username,
      cookie
    }
  };
  res.render('upload', rendObj);
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
    response.msg = signupMessages.email.error[err];
    res.json(response); // Invalid email
    return;
  }

  var mongoQuery = { email : email, _type: 'User' };
  if(req.query.excludeUser){
    mongoQuery._id = {$ne : req.query.excludeUser}
  }

  User.count(mongoQuery).exec()
  .then(
    function onEmail(count) {
      if (count !== 0) {
        response.err = 'taken';
        response.msg = signupMessages.email.error.taken;
        res.json(response); // Taken email
        return null;
      }
      response.msg = signupMessages.email.isaok.ok;
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
      logger.error('Error during email availability check: ' +
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
  if (!! err) {
    response.err = err;
    response.msg = signupMessages.username.error[err];
    res.json(response); // Blank or Invalid username (or taken for reserved routes)
    return;
  }

  var mongoQuery = { username : username, _type: 'User' };
  if(req.query.excludeUser){
    mongoQuery._id = {$ne : req.query.excludeUser}
  }

  User.count(mongoQuery).exec()
  .then(
    function onUser(count) {
      if (count !== 0) {
        response.err = 'taken';
        response.msg = signupMessages.username.taken;
        res.json(response); // Taken username
      } else {
        response.msg = signupMessages.username.isaok.ok;
        res.json(response);
      }
  }).then(null,
    function onError(err) {
      logger.error('Error during user availability check: ' +
        err.toString(), { err: err.stack });
      response.msg = 'Error during user availability check: ' + err.toString();
      res.json(500, response);
  });
}

 const putLiveViewer = coroutine(function *putLiveViewerGen(req, res){
  try{
    const username = req.body.viewerUsername;
    const email    = req.body.viewerEmail;

    //Find user
    let user
    if (req.isAuthenticated()){
      user = req.user;
    } else {
      user = yield GuestUser.findOne({ browserSessionId :  req.sessionID }).exec();
    }

    if(!user) {
      return res.status(404).json({
        error: true,
        type:'invalid_request_error',
        message: "User doesn't exist"
      })
    }

    user.screenName = username || user.screenName;
    user.email = email || user.email;

    yield user.save()

    res.json({
      error: false,
      message: "user updated"
    });
  }catch(err){

    if(err.name == "MongoError" && err.code == "1100"){
      return res.json({
        error: true,
        message: "email should be unique"
      });
    }else{
      return res.json({
        error: true,
        message: err.message
      });
    }
  }
  
});

module.exports = {
  getHomePage       : getHomePage,
  getCompleteRegistration  : getCompleteRegistration,
  postCompleteRegistration : postCompleteRegistration,
  getSignup         : getSignup,
  postSignup        : postSignup,
  getLogin          : getLogin,
  postLogin         : postLogin,
  getLoginCampus  : getLoginCampus,
  postLoginCampus : postLoginCampus,
  logout            : logout,
  getUploadForm     : getUploadForm,
  emailAvailable    : emailAvailable,
  usernameAvailable : usernameAvailable,
  putLiveViewer: putLiveViewer
}
