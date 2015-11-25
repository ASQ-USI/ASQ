var debug = require('bows')("asqw-connection")
  , io = require('socket.io-client');

Polymer({
  is: 'asqw-connection',
  
  socket: null,
  eventBus : null,

  socketEvents: [
    "connect",
    "disconnect",
    "reconnect_attempt",
    "connect_error",
    "connect_failed",
    "error"
  ],

  events2Forward: [
    "asq:sessionFlow",
    "asq:folo-connected",
    "asq:ctrl-connected",
    "asq:ghost-connected",
    "asq:folo-disconnected",
    "asq:ctrl-disconnected",
    "asq:ghost-disconnected",
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
    "asq:session-terminated",
    "/user/presentation/thumbnails",
    "/user/presentation/fontfaces"
  ],

  emit: function() {
    this.socket.emit.apply(this.socket, arguments);
  },

  // TODO: add asserts for the arguments
  connect: function(protocol, host, port, session, namespace, token, eventBus) {
    this.eventBus = eventBus;

    var socketUrl =  protocol + '//' + host + ":" + port + '/' + namespace;
    this.socket = io.connect(socketUrl, { 
      'query': 'token=' + token+'&asq_sid=' + session 
    });

    // events related to socket.io
    this.socketEvents.forEach(function(eventName){
      this.socket
      .on(eventName, function onSocketEvent(evt) {
        this.eventBus.emit("socket:"+ eventName, evt);
      }.bind(this));
    }.bind(this));

    // application events
    this.events2Forward.forEach(function(eventName){
      this.socket
      .on(eventName, function onEvent2Forward(evt) {
        this.eventBus.emit(eventName, evt);
      }.bind(this));
    }.bind(this));

    // 
    this.eventBus.on('socket-request', function(evt){
       this.socket.emit(evt.name, evt.detail)
    }.bind(this))
  }
});