/**
 @fileoverview Socket code for the client.
 */

/** Connect back to the server with a websocket */
var debug = require('bows')("viewer")
var _ = require('lodash');
var io = require('socket.io-client');


var socketEvents = [
  "connect",
  "disconnect",
  "reconnect_attempt",
  "connect_error",
  "connect_failed",
  "error"
];

var events2Forward = [];

this.socket = null;

this.emit = function() {
  this.socket.emit.apply(this.socket, arguments);
}

this.addEvents2Forward = function(events){
  if (_.isString(events)){
    events = [events]
  }

  events2Forward = _.union(events2Forward, events);
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