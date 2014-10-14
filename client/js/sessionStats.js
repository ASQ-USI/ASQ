/**
 @fileoverview code for the socketstats view.
 *
 */

 module.exports = function sessionStats(){
  'use strict';

  var debug = require('bows')("sessionStats")
  , io      = require('socket.io-client')
  , $       = require('jquery')
  , request = require('superagent')
  , dust = require('dust')
  , templates = require('./templates')
  , $body, $list, socket;

  $(function(){
    $body   = $('body');
    $list = $('#answer-list');

    //check if the session is live
    if($body.hasClass('live')){
      var host    =  $body.attr('data-asq-host')
      , port      = parseInt($body.attr('data-asq-port'))
      , sessionId = $body.attr('data-asq-session-id')
      , mode      = $body.attr('data-asq-socket-mode')
      , token     = $body.attr('data-asq-socket-token');

      connect(host, port, sessionId, mode, token);
    }
  });

  /** Connect back to the server with a websocket */

  function connect(host, port, session, mode, token, slidesTree) {
    debug('Connecting to socket server');
    var socketUrl =  window.location.protocol + '//' + host + '/ctrl';
    socket = io.connect(socketUrl, { 
      'query': 'token=' + token+'&asq_sid=' + session 
    });

    socket.on('connect', function(event) {

      socket.on('asq:folo-connected', onFoloConnected);

      socket.on('asq:user-session-stats', onUserSessionStats);

      socket.on('asq:assessment', onAssessment);

    });
  }

  function onFoloConnected(event){
    if (event.screenName && event.token) {
      debug('Viewer ' + event.screenName + ' connected');
    }
    addUser(event.screenName, event.token)
  }

  function addUser(screenName, token){
    if(! screenName){
      debug('screenName is empty');
      return;
    }
    if(! token){
      debug('token is empty');
      return;
    }

    //user is already in the list
    if($list.find('.al-entry#'+token).length){ return;}

    //get answer state for user
    socket.emit('asq:get-user-session-stats', {
      'userId' : token,
      'sessionId' : $body.attr('data-asq-session-id')
    });
  }

  function onUserSessionStats(evt){
    //user is already in the list
    if($list.find('.al-entry#'+ evt.user.id).length){ return;}

    dust.render('alEntry', evt, function(err, out){
      if(err){ return debug(err.msg + ' ' + err.stack);}
      $list.append(out);
    });

    $list.find('.al-entry#'+ evt.user.id).addClass('new')
    setTimeout(function(){
      $list.find('.al-entry#'+ evt.user.id).removeClass('new')
    },3000);
  }

  function onAssessment(evt){
    try{
      var assessment= evt;
      // Currently we support auto assessments only
      if(assessment.type !=='auto') return;
      var selector = '.al-entry#'+ assessment.assessee;
      var newClass = 'al-' + (assessment.score == 100 ? 'correct' : 'wrong');
      selector += ' .al-timeline-answers[data-question-id="'+ assessment.question +'"]';
      $list.find(selector).removeClass('al-pending', 'al-correct', 'al-wrong').addClass(newClass)
    }catch(err){
      debug(err.msg + err.stack)
    }
  }
}
