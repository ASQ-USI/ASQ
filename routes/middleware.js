var passport       = require('passport')
  , authentication = require('../lib/authentication')
  , utils          = require('../lib/utils/routes');

var authorizeSession = authentication.authorizeSession;

function forceSSL(req, res, next) {
  if (!req.secure) {
    appLogger.log('HTTPS Redirection');
    return res.redirect(['https://', process.env.HOST,
        (app.get('port') === '443' ? '' : (':' + app.get('port'))),
        req.url].join(''));
  }
  next(null);
}

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function isAuthenticated(req, res, next) {
  req.isAuthenticated() ? next(null) : next(new Error('Could not authenticate'));
}

function isNotAuthenticated(req, res, next) {
  !req.isAuthenticated() ? next(null) : next(new Error('Already authenticated'));
}

/*  Most of ASQ Features need the user to have completed registration
 *  in order to have a valid ASQ username.
 */
function isRegistrationComplete(req, res, next) {
  if (!req.user) {
    next(new Error('There is no authenticated user to check'));
  } else if (req.user.regComplete != true) {
    req.session.redirect_to = req.originalUrl;
    res.redirect('/complete-registration')
  } else {
    next(null);
  }
}

/*  Most of ASQ Features need the user to have completed registration
 *  in order to have a valid ASQ username.
 */
function isNotRegistrationComplete(req, res, next) {
  if (!req.user) {
    next(new Error('There is no authenticated user to check'));
  } else if (req.user.regComplete == true) {
    res.redirect(utils.redirectToOrGoHome(req))
  } else {
    next(null);
  }
}

/*  For a route with the user parameter, check if the request comes from the
 *  authenticated user whose name matches the user parameter.
 */
function isRouteOwner(req, res, next) {
  if (!req.params.user) {
    next(new Error('Invalid route: missing user parameter.'));
  } else if (req.params.user != req.user.username) {
    next(new Error('Is not owner'));
  } else {
    req.isOwner=true;
    next(null);
  }
}

// var localAuthenticate = passport.authenticate('local', {
//   failureRedirect : '/login/',
//   failureFlash    : true
// });

var localAuthenticate = passport.authenticate('local-mongo', {
  failureRedirect : '/login/',
  failureFlash    : true
});

// var ldapAuthenticate = passport.authenticate('ldapauth', {
//   failureRedirect : '/login-campus/',
//   failureFlash    : true
// });

var ldapAuthenticate = passport.authenticate('local-ldap', {
  failureRedirect : '/login-campus/',
  failureFlash    : true
});

function setLiveSession(req, res, next, liveId) {
  var Session = db.model('Session', schemas.sessionSchema);
  Session.findOne({ _id: liveId, endDate: null }).populate('slides')
    .exec().then(function onSession(session) {
      if (session) {
        req.liveSession = session;
        return next(null);
      } else {
        return next(new Error('Failed to load session.'));
      }
    }, function onError(err) {
      return next(err);
    });
}

module.exports = {
  authorizeSession   : authorizeSession,
  forceSSL           : forceSSL,
  isAuthenticated    : isAuthenticated,
  isNotAuthenticated : isNotAuthenticated,
  isRouteOwner       : [ 
    isAuthenticated, 
    isRegistrationComplete,
    isRouteOwner 
  ],
  isNotRegistrationComplete : [ 
    isAuthenticated, 
    isNotRegistrationComplete,
  ],
  ldapAuthenticate   : ldapAuthenticate,
  localAuthenticate  : localAuthenticate,
  setLiveSession     : setLiveSession,
  validateLdapUser   : require('../lib/ldap').validateLdapUser
}
