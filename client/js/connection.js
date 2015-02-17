/**
 @fileoverview Socket code for the client.
 */

/** Connect back to the server with a websocket */
var debug = require('bows')("viewer")
  , io = require('socket.io-client');


this.socket = null;

this.emit = function() {
  this.socket.emit.apply(this.socket, arguments);
}

// TODO: add asserts for the arguments
this.connect = function(protocol, host, port, session, mode, token, eventBus) {
  var eb = eventBus;

  var socketUrl =  protocol + '//' + host + ":" + port + '/' + mode;
  this.socket = io.connect(socketUrl, { 
    'query': 'token=' + token+'&asq_sid=' + session 
  });

  this.socket
  .on('connect', function onConnect(evt) {
    eb.emit('socket:connect', evt);
  })

  .on('asq:sessionFlow', function onSessionFlow(evt) {
    eb.emit('asq:sessionFlow', evt);
  })

  .on('asq:answered-all', function onAnsweredAll(evt){
    eb.emit('asq:answered-all', evt);
  })

  .on('asq:user-session-stats', function onUserSessionStats(evt){
    eb.emit('asq:user-session-stats', evt);
  })

  .on('asq:rankings', function onRankings(evt){
    eb.emit('asq:rankings', evt);
  })

  /**
   Handle socket event 'goto'
   Uses impress.js API to go to the specified slide in the event.
   */
  .on('asq:goto', function onGoto(evt) {
    eb.emit('asq:goto', evt);
  })

  /**
   Indicate a submission was accepted.
   **/
  .on('asq:submitted', function onSubmitted(evt) {
    eb.emit('asq:submitted', evt);
  })

  /**
  * Received assessment for self
  */
  .on('asq:assessment', function onAssessment(evt){
    eb.emit('asq:assessment', evt);
  })

  .on('asq:assess', function onAssess(evt) {
    eb.emit('asq:assess', evt);
  })

  .on('asq:stat', function onStat(evt) {
    eb.emit('asq:stat', evt);
  })

  /**
    Generic event to be consumed by interested question types
  */
  .on('asq:question_type', function onQuestionType(evt){
    eb.emit('asq:question_type', evt);
  })

  .on('asq:session-terminated', function sessionTerminated(evt) {
    eb.emit('asq:session-terminated', evt);
  })

  // TODO: check if the following three exist
  .on('disconnect', function onDisconnect(evt) {
    eb.emit('socket:disconnect', evt);
  })

  .on('reconnect_attempt', function(evt) {
    console.log(evt)
    eb.emit('socket:reconnect_attempt', evt);
  })

    .on('connect_error', function(evt) {
    console.log(evt)
    eb.emit('socket:connect_error', evt);
  })

  .on('connect_failed', function(evt) {
    console.log(evt)
    eb.emit('socket:connect_error', evt);
  })

  .on('error', function (evt){
    console.log(evt)
    eb.emit('socket:error', evt);
  });
}