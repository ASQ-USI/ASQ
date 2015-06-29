'use strict';

var when        = require('when');
var gen         = require('when/generator');
var wkeys       = require('when/keys');
var nodefn      = require('when/node/function');
var logger   = require('../logger').appLogger;
var Session     = db.model('Session');
var Question    = db.model('Question');

module.exports = function(socketUtils){

  /*
   *  Emit an event to the ctrl, folo & ghost namespaces to go to a specific slide.
   */
  var goto = gen.lift(function *gotoGen(socket, evt) {
    try{
      //only accept ctrl goto events
      if (socket.nsp.name !== '/ctrl') return;
      var session = yield Session.findOne({_id: socket.request.sessionId}).exec();

      // TODO load adapter based on presentation type
      var adapter = require('../presentationAdapter/adapters').impress;
      var nextSlide = adapter.getSlideFromGotoData(evt.data);

      if (nextSlide == null){
        logger.debug("lib.uitls.socket:goto nextSlide is null")
        //drop event
        return;
      }

      var results = yield when.all([
          session.questionsForSlide(nextSlide),
          session.statQuestionsForSlide(nextSlide)
      ]);

      session.activeSlide = nextSlide;
      session.activeQuestions = results[0];
      session.activeStatsQuestions = results[1];

      if (!! session.activeStatsQuestions.length) {
        evt.stats  = yield socketUtils.getStats(session.activeStatsQuestions, session._id);
      }

      //save does not return a promise
      yield session.save();
      socketUtils.emitToRoles('asq:goto', evt, session._id, 'ctrl', 'folo', 'ghost');

    }catch(err) {
      logger.error('On goto: ' + err.message, {err: err.stack});
    };
  });

  var handleSocketEvent = function(eventName, socket, evt){
     switch(eventName){
      case "asq:goto":
        goto(socket, evt);
        break
     }
  }

  return{
    handleSocketEvent:handleSocketEvent
  }

}
