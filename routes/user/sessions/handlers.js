require('when/monitor/console');

var _        = require('lodash')
, gen        = require('when/generator')
, errorTypes = require('../../errorTypes')
, lib        = require('../../../lib')
, appLogger  = lib.logger.appLogger
, stats      = require('../../../lib/stats/stats')
, Rubric     = db.model('Rubric')
, Session    = db.model('Session')
, User       = db.model('User');



/* Stats */
exports.getSessionStats = gen.lift(function *getSessionStatsGen(req, res, next) {
  var session ;
  try{
    var session = yield Session.findById(req.params.sessionId).exec();
  }catch(err){
    appLogger.error("Session %s not found", req.params.sessionId);
    appLogger.error(err.message, { err: err.stack });
    res.status(404);
    return res.render('404', {'msg': 'Presentation not found'});
  }

  try{
    var statsObj = yield stats.getSessionStats(session);
    // statsObj.session = {
    //   start: session.start
    // }
    statsObj.sessionId = req.params.sessionId;
    statsObj.username = req.user.username;
    statsObj.questionWidth = (100/statsObj.questions.length)
    statsObj.host = ASQ.appHost;
    statsObj.port = app.get('port');
    return res.render('sessionStats', statsObj);
  }catch(err){
    appLogger.error("Session %s not found", req.params.sessionId);
    appLogger.error(err.message, { err: err.stack });
    next(err)
  }
});
