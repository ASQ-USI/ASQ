var debug = require('bows')("adapter-socket-interface");

Polymer({

  is: 'adapter-socket-interface', 

  properties: {
    socket: {
      type: Object,
      value: function() { return null;},
      observer: 'socketChanged'
    }
  },

  bounce : false,

  ready : function(){
    this.cbs = [];
  },

  socketChanged : function(newSocket, oldSocket){
    if(newSocket){
      newSocket.on("asq:goto", function onSocketGoto(evt){
        debug("Reveived goto event:", evt);
        this.onGotoReceived(evt);
      }.bind(this));
    }
  },

  setBounce: function(val){
    this.bounce = !! val;
  },

  onGotoReceived : function(evt){
    for(var i = 0, l = this.cbs.length; i<l; i++){
      //don't let one bad function affect the rest of them
      try{
        this.cbs[i].call(null, evt.data);
      }catch(err){
        debug(err.toString() + err.stack);
      }
    }
  },

  onGoto :function(cb){
    if("function" !== typeof cb){
      throw new Error("cb should be a function")
    }
    this.cbs.push(cb)
  },

  offGoto :function(cb){
    if("function" !== typeof cb){
      throw new Error("cb should be a function")
    }
    var index = this.cbs.indexOf(cb);

    if (index > -1) {
        this.cbs.splice(index, 1);
    }
  },

  emitGoto : function(data){
    debug("Emitting goto data:", data);
    this.socket.emit('asq:goto', {
      data : data
    });
    debug("Data was emitted:");
  },

  bounceGoto : function(data){
    debug("Bouncing goto data:", data);
    this.onGotoReceived({data : data });
    debug("Data was bounced:");
  }
});
