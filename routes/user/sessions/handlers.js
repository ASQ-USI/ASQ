require('when/monitor/console');
;
var _         = require('lodash');
var gen         = require('when/generator');
var moment      = require('moment');
var errorTypes  = require('../../errorTypes');
var lib         = require('../../../lib');
var sockAuth    = require('../../../lib/socket/authentication');
var logger      = require('logger-asq');
var stats       = require('../../../lib/stats/stats');
var Rubric      = db.model('Rubric');
var Session     = db.model('Session');
var User        = db.model('User');



/* Stats */
exports.getSessionStats = gen.lift(function *getSessionStatsGen(req, res, next) {
  var session ;
  try{
    var session = yield Session.findById(req.params.sessionId).exec();
  }catch(err){
    logger.error("Session %s not found", req.params.sessionId);
    logger.error(err.message, { err: err.stack });
    res.status(404);
    return res.render('404', {'msg': 'Presentation not found'});
  }

  try{
    var statsObj = yield stats.getSessionStats(session);
    var endDate = session.endDate 
      ? moment(session.endDate).format('MMMM Do YYYY, h:mm:ss a')
      : undefined;
    statsObj.session = {
      id : session._id.toString(),
      startDate:  moment(session.startDate).format('MMMM Do YYYY, h:mm:ss a'),
      endDate : endDate
    };
    statsObj.username = req.user.username;
    statsObj.questionWidth = (100/statsObj.questions.length);
    if(session.endData === null || session.endData === undefined){
      var token = sockAuth.createSocketToken({'user': req.user, 'browserSessionId': req.sessionID})
      statsObj.host = ASQ.appHost;
      statsObj.port = app.get('port');
      statsObj.live = true;
      statsObj.mode = 'ctrl';
      statsObj.token = token;
    }
    return res.render('sessionStats', statsObj);
  }catch(err){
    logger.error("Session %s not found", req.params.sessionId);
    logger.error(err.message, { err: err.stack });
    next(err)
  }
});
