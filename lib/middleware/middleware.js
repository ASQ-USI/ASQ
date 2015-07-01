/** 
  * @module lib/middleware/middleware
  * @description middleware functions
*/

var passport       = require('passport');
var logger         = require('logger-asq');
var authentication = require('../authentication');
var ldap           = require('../ldap');
var errorTypes     = require('../../errors/errorTypes');
var utils          = require('../utils/routes');

module.exports  = {

  authorizeLiveSession: authentication.authorizeLiveSession,
  validateLdapUser   : ldap.validateLdapUser,

  // Simple route middleware to ensure user is authenticated.
  //   Use this route middleware on any resource that needs to be protected.  If
  //   the request is authenticated (typically via a persistent login session),
  //   the request will proceed.  Otherwise, the user will be redirected to the
  //   login page.
  ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
          return next();
      }
      if (req.url=="/") {
          res.render('index', {
          'message': req.flash('error'),
          'fromsignup': false
        });
      } else {
          res.redirect("/");
      }
      return false; //Ensure a value is always returned
  },

  forceSSL: function (req, res, next) {
    if (!req.secure) {
      logger.log('HTTPS Redirection');
      return res.redirect(['https://', process.env.HOST,
          (app.get('port') === '443' ? '' : (':' + app.get('port'))),
          req.url].join(''));
    }
    next(null);
  },

  isExistingUser: function (req, res, next, username) {
    var User = db.model('User');
    User.findOne({ username : username }).exec()
    .then(
      function onUser(user) {
        if (! user) {
          errorTypes.add('invalid_request_error');
          res.status(404);
          return res.render('404', {'msg': 'User ' + username + ' does not exist!'});
          //return next(Error.http(404, 'User ' + username + ' does not exist!', {type:'invalid_request_error'}));
        } else {
          req.routeOwner = user;
          next(null);
        }
      }, function onError(err) {
        next(err);
    });
  },

  // Simple route middleware to ensure user is authenticated.
  //   Use this route middleware on any resource that needs to be protected.  If
  //   the request is authenticated (typically via a persistent login session),
  //   the request will proceed.  Otherwise, the user will be redirected to the
  //   login page.
  isAuthenticated: function (req, res, next) {
    req.isAuthenticated() ? next() : next(new Error('Could not authenticate'));
  },

  isNotAuthenticated: function (req, res, next) {
    !req.isAuthenticated() ? next() : next(new Error('Already authenticated'));
  },

  isNotAuthenticatedOrGoHome: function (req, res, next) {
    !req.isAuthenticated() 
    ? next(null) 
    : res.redirect('/');
  },


  /*  Most of ASQ Features need the user to have completed registration
   *  in order to have a valid ASQ username.
   */
  isRegistrationComplete: function (req, res, next) {
    if (!req.user) {
      next(new Error('There is no authenticated user to check'));
    } else if (req.user.regComplete != true) {
      req.session.redirect_to = req.originalUrl;
      res.redirect('/complete-registration')
    } else {
      next(null);
    }
  },

  /*  Most of ASQ Features need the user to have completed registration
   *  in order to have a valid ASQ username.
   */
  isNotRegistrationComplete: function(req, res, next) {
    if (!req.user) {
      next(new Error('There is no authenticated user to check'));
    } else if (req.user.regComplete == true) {
      res.redirect(utils.getPreviousURLOrHome(req))
    } else {
      next(null);
    }
  },

  /*  For a route with the user parameter, check if the request comes from the
   *  authenticated user whose name matches the user parameter.
   */
  isRouteOwner: function(req, res, next) {
    if (!req.params.user) {
      next(new Error('Invalid route: missing user parameter.'));
    } else if (req.params.user != req.user.username) {
      next(new Error('Is not owner'));
    } else {
      req.isOwner=true;
      next(null);
    }
  },

  localAuthenticate : passport.authenticate('local-mongo', {
    failureRedirect : '/login/',
    failureFlash    : true
  }),

  ldapAuthenticate : passport.authenticate('local-ldap', {
    failureRedirect : '/login-campus/',
    failureFlash    : true
  }),

  // TODO: if session is not found redirect somewhere sane
  setLiveSession: function (req, res, next, liveId) {
    var Session = db.model('Session', schemas.sessionSchema);
    Session.findOne({
      _id: liveId,
      slides:req.params.presentationId,
      presenter: req.routeOwner._id,
      endDate: null
    }).populate('slides')
      .exec().then(function onSession(session) {
        if (session) {
          req.liveSession = session;
          return next(null);
        } else {
          res.status(404);
          return res.render('404', {'msg': 'This session does not exist or it\'s not live.'});
        }
      }, function onError(err) {
        return next(err);
      });
  },
};

module.exports.isRouteOwner = [
    module.exports.isAuthenticated,
    module.exports.isRegistrationComplete,
    module.exports.isRouteOwner
  ];

module.exports.isNotRegistrationComplete = [
    module.exports.isAuthenticated,
    module.exports.isNotRegistrationComplete,
  ]
