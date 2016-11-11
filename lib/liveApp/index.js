const SessionEvent = db.model('SessionEvent');

module.exports = {
  handleSliderChange:function(socket,evt){
      // console.log("#################### -- EVT -- ####################");
      // console.log(evt)
      evt.data = evt.data || {};
      evt.data.user = socket.user._id;
      SessionEvent.create({
          session: socket.request.sessionId ,
          type: evt.type,
          data: evt.data
      });
  }

};