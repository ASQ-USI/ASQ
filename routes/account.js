function Account(app, authenticate) {
  this.app = app;
  this.authenticate = authenticate;
}

Account.prototype.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
        return next();
    }
  req.flash('error', 'Could not authenticate you.');
  res.redirect(401, '/sign_in');
}

Account.prototype.getSignIn = function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect(302, '/');
  } else {
    res.render('sign_in',
      { message : req.flash(error),
      })
  }
}

Account.prototype.postSignIn = function(req, res) {
  // body...
}

Account.prototype.postRegister = function(arguments) {
  // body...
}

Account.prototype.getRegister = function(req, res) {
  res.render('register');
}

Account.prototype.setUp = function() {
  this.app.get('/sign_in', )
}