/**
 @fileoverview Socket code for the client.
 */

/** Connect back to the server with a websocket */
var debug = require('bows')("viewer")
  , io = require('socket.io-client');


var socketEvents = [
  "connect",
  "disconnect",
  "reconnect_attempt",
  "connect_error",
  "connect_failed",
  "error"
];

var events2Forward = [
  "asq:sessionFlow",
  "asq:folo-connected",
  "asq:ctrl-connected",
  "asq:ghost-connected",
  "asq:connected-clients",
  "asq:answered-all",
  "asq:user-session-stats",
  "asq:rankings",
  "asq:goto",
  "asq:submitted",
  "asq:assessment",
  "asq:assess",
  "asq:stat",
  "asq:question_type",
  "asq:session-terminated"
];

this.socket = null;

this.emit = function() {
  this.socket.emit.apply(this.socket, arguments);
}

// TODO: add asserts for the arguments
this.connect = function(protocol, host, port, session, namespace, token, eventBus) {
  var eb = eventBus;

  var socketUrl =  protocol + '//' + host + ":" + port + '/' + namespace;
  this.socket = io.connect(socketUrl, { 
    'query': 'token=' + token+'&asq_sid=' + session 
  });

  // events related to socket.io
  socketEvents.forEach(function(eventName){
    this.socket
    .on(eventName, function onSocketEvent(evt) {
      eb.emit("socket:"+ eventName, evt);
    }.bind(this));
  }.bind(this));

  // application events
  events2Forward.forEach(function(eventName){
    this.socket
    .on(eventName, function onEvent2Forward(evt) {
      eb.emit(eventName, evt);
    }.bind(this));
  }.bind(this));
}