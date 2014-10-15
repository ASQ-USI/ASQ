var handlers      = require('./handlers')
  , appLogger    = require('../../../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting session routes');

  // Stats for specific session.
  app.get('/:user/sessions/:sessionId/stats', middleware.isRouteOwner,
    function setLiveSession(req, res, next) {
      var Session = db.model('Session', schemas.sessionSchema);
      Session.findOne({
        _id: req.params.sessionId,
        endDate: null
      }).exec().then(function onSession(session) {
          if (session) {
            req.liveSession = session;
            return next(null);
          } else {
            return next(new Error('Failed to load session.'));
          }
        }, function onError(err) {
          return next(err);
        });
    },
    middleware.authorizeLiveSession,  handlers.getSessionStats);
}
