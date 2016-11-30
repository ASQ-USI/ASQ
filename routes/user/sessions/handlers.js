
const _ = require('lodash');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const moment = require('moment');
const errorTypes = require('../../../errors/errorTypes');
const lib = require('../../../lib');
const sockAuth = require('../../../lib/socket/authentication');
const logger = require('logger-asq');
const stats = require('../../../lib/stats/stats');
const Rubric = db.model('Rubric');
const Session = db.model('Session');
const User  = db.model('User');



/* Stats */
exports.getSessionStats = coroutine(function *getSessionStatsGen(req, res, next) {
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
      statsObj.host = req.app.locals.urlHost;
      statsObj.port = req.app.locals.urlPort;
      statsObj.live = true;
      statsObj.mode = 'ctrl';
    }
    return res.render('sessionStats', statsObj);
  }catch(err){
    logger.error("Session %s not found", req.params.sessionId);
    logger.error(err.message, { err: err.stack });
    next(err)
  }
});
