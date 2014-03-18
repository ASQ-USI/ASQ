var lib     = require('../lib') 
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
  var passwordConfirm = req.body.signuppasswordconfirm;

  var validUserForm = utils.isValidUserForm( data.firstname, data.lastname,
    data.email, data.username, data.password, passwordConfirm
  );

  if (validUserForm === null) { //TODO handle errors
     // Username availability and saving
    var User = db.model('User', schemas.userSchema);
    User.findOne({ username : data.username },
      function(err, user) {
        if (user) {
          res.render('login', { //TODO render proper signup page
            message    : 'Username ' + user + ' already taken',
            formsignup : true
          });
        } else {
        var newUser = new User(data);
        newUser.save(function(err) {
          if (err) {
            appLogger.error('Registration - ' + err.toString());
            res.render('login', {
              message : 'Something went wrong. The great ASQ Server said: '
                  + err.toString()
            });
          }
          req.login(newUser, function(err) {
            if (err) {
              appLogger.error('First login - ' + err.toString());
              res.render('login', {
              message : 'Something went wrong. The great ASQ Server said: '
                  + err.toString()
              });
            }
            res.redirect('/' + data.username
                + '/?alert=Registration Succesful&type=success');
          });
        });
      }
    });
  }else{
    console.log(validUserForm)
    res.render('login', {
      message : 'Something went wrong. The great ASQ Server said: You specified wrong data',
       // + validUserForm.toString(),
      formSignup : true
      });
  }
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