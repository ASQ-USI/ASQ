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
  , $body, $list, socket, total;

  $(function(){
    $body   = $('body');
    $list = $('#answer-list');
    total = $('.al-timeline-head-answers').length

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
      debug('Connected')

      socket.on('asq:folo-connected', onFoloConnected);

      socket.on('asq:user-session-stats', onUserSessionStats);

      socket.on('asq:assessment', onAssessment);

      socket.on('asq:rankings', onRankings);

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
      var $entrySelector = $list.find('.al-entry#'+ assessment.assessee); 
      var selector = '.al-timeline-answers[data-question-id="'+ assessment.question._id +'"]';
      var newClass = 'al-' + (assessment.score == 100 ? 'correct' : 'wrong');
      $entrySelector
        .find(selector)
          .removeClass('al-pending', 'al-correct', 'al-wrong')
          .addClass(newClass);
      var score = $entrySelector.find('.al-timeline-answers.al-correct').length;
      $entrySelector.find('.al-score').text(score)
    }catch(err){
      debug(err.msg + err.stack)
    }
  }

  function onRankings (evt){
    try{
      var rankings = evt.rankings;

      rankings.forEach(function(ranking, idx){
        var rank = idx+1;

        var rankClass = ''
        if(rank === 1){
          rankClass = 'rank-first';
        }else if(rank === 2){
          rankClass = 'rank-second';
        }else if(rank === 2){
          rankClass = 'rank-third';
        }

        var $entrySelector = $list.find('.al-entry#'+ ranking.userId); 
         $entrySelector
          .find('.al-rank')
            .removeClass('rank-first rank-second rank-third')
            .addClass(rankClass)
            .text('#'+rank);
      });
    }catch(err){
       debug(err.msg + '\n' + err.stack);
    }
  }
}
