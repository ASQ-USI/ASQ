var lib     = require('../lib')
  , validation = require('../sahred/validation')
  , utils     = lib.utils.form
  , appLogger = lib.logger.appLogger
  , _ = require('lodash');

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

function postSignup(req, res) {
  //TODO change those horrible signup...
  var data = {};
  data.firstname      = req.body.signupfirstname;
  data.lastname       = req.body.signuplastname;
  data.screenName     = data.firstname + ' ' + data.lastname;
  data.email          = req.body.signupemail;
  data.username       = req.body.signupusername;
  data.password       = req.body.signuppassword;
  data.passwordConfirm = req.body.signuppasswordconfirm;

  var errs = validation.getErrorsInSignUp(data);

  errEmail = (!!errs.email) ? true :
  User.count({ email: data.email, _type: 'User' }).exec();

  errUsername = (!!errs.username) ? true :
  User.count({ username: data.username, _type: 'User' }).exec();

  when.join(validEmail, validUsername)
  .then(
    function onDbCheck(data) {
      if (!errs.email) {
        errs.email = data[0] === 0 ? null : 'taken';
      }
      if (!errs.username) {
        errs.username = data[1] === 0 ? null : 'taken';
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
          deferred.resolve(err);
        }
      });
      return deferred.promise;
  }).then(
    function onNewUser(user) {
      req.login(user, function onLogin(err) {
        if (err) {
          var error = new Error('User created but login faild with: ' +
              res.render('login', {
              message : 'Something went wrong. The great ASQ Server said: '
            err.toString());
          throw error;
        }
        res.redirect('/' + user.username +
          '/?alert=Registration%20Succesful&type=success');
      });
  }).then(null,
    function onError() {
      res.render('signup', {
        tipMessages : require('../lib/forms/signupFormMessages')
      });
    });
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
    : '/' + req.body.username + '/' ;
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

module.exports = {
  getHomePage   : getHomePage,
  getSignup   : getSignup,
  postSignup  : postSignup,
  getLogin     : getLogin,
  postLogin    : postLogin,
  logout       : logout,
  getUploadForm : getUploadForm
}
