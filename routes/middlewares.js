var passport = require('passport'); //TODO Set up passport in lib folder!

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function isAuthenticated(req, res, next) {
    req.isAuthenticated() ? next() : next(new Error('Could not authenticate'));
    // if (req.isAuthenticated()) {
    //     return next();
    // }
    // if (req.url=="/") {
    //     res.render('index', {
    //     'message': req.flash('error'),
    //     'fromsignup': false
    //   });
    // } else {
    //     res.redirect("/");
    // }
    // return false; //Ensure a value is always returned
}

function isNotAuthenticated(req, res, next) {
    !req.isAuthenticated() ? next() : next(new Error('Already authenticated'));
}

/*  For a route with the user parameter, check if the request comes from the
 *  authenticated user whose name matches the user parameter.
 */
function isRouteOwner(req, res, next) {
    if (!req.params.user) {
        next(new Error('Invalid route: missing user parameter.'));
    } else if (req.params.user != req.user.name) {
         next(new Error('Is not owner'));
    } else {
        next();
    }
}

var localAuthenticate = passport.authenticate('local', {
  failureRedirect : '/sign_in',
  failureFlash    : true
});

module.exports = {
    isAuthenticated    : isAuthenticated,
    isNotAuthenticated : isNotAuthenticated,
    isRouteOwner       : isRouteOwner,//[ isAuthenticated, isRouteOwner ],
    localAuthenticate  : localAuthenticate
}