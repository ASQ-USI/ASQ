/** @module client/js/snitch
    @description activity event listeners.
*/



'use strict';

var debug = require('bows')("snitch");
var $ = require('jquery');

module.exports = function(eventBus){

  if(! eventBus) throw new Error("snitch needs an eventBus");

  $(function(){

    $('asq-exercise').each(function(idx, el){
      $(el).attr('tabindex', '0');
      $(el).on('focus', function(e){
        eventBus.emit('exercisefocus', {
          exerciseUid: $(el).attr('uid'),
          clienttimestamp: new Date().toISOString()
        });
      }).on('blur', function(e){
        eventBus.emit('exerciseblur', {
          exerciseUid: $(el).attr('uid'),
          clienttimestamp: new Date().toISOString()
        });
      })
    });

    document.addEventListener("focusin", function(evt) {
      var uid = evt.target.getAttribute('uid') || '';
      var tagname = event.target.tagName.toLowerCase();
      var eventName = "tab" + document.visibilityState;
      eventBus.emit("focusin", {
        uid: uid,
        tagname: tagname,
        clienttimestamp: new Date().toISOString()
      });
    });

    document.addEventListener("focusout", function(evt) {
      var uid = evt.target.getAttribute('uid') || '';
      var tagname = event.target.tagName.toLowerCase();
      var eventName = "tab" + document.visibilityState;
      eventBus.emit("focusout", {
        uid: uid,
        tagname: tagname,
        clienttimestamp: new Date().toISOString()
      });
    });

    document.addEventListener("input", function(evt) {
      var uid = evt.target.getAttribute('uid') || '';
      var tagname = event.target.tagName.toLowerCase();
      var eventName = "tab" + document.visibilityState;
      eventBus.emit("input", {
        uid: uid,
        tagname: tagname,
        value: evt.target.value,
        clienttimestamp: new Date().toISOString()
      });
    });

    document.addEventListener("questioninput", function(evt) {
      var uid = evt.target.getAttribute('uid') || '';
      var tagname = event.target.tagName.toLowerCase();
      var eventName = "tab" + document.visibilityState;
      eventBus.emit("questioninput", {
        uid: uid,
        tagname: tagname,
        value: evt.target.value,
        clienttimestamp: new Date().toISOString()
      });
    });

    document.addEventListener("exercise-edit", function(evt) {
      var uid = evt.target.getAttribute('uid') || '';
      var tagname = event.target.tagName.toLowerCase();
      var eventName = "tab" + document.visibilityState;
      eventBus.emit("exercise-edit", {
        uid: uid,
        tagname: tagname,
        value: evt.target.value,
        clienttimestamp: new Date().toISOString()
      });
    });

    document.addEventListener("visibilitychange", function() {
      var eventName = "tab" + document.visibilityState;
      eventBus.emit(eventName, {
        clienttimestamp: new Date().toISOString()
      });
    });

    window.addEventListener('focus', function(){
      eventBus.emit('windowfocus', {
        clienttimestamp: new Date().toISOString()
      });
    })

    window.addEventListener('blur', function(){
      eventBus.emit('windowblur', {
        clienttimestamp: new Date().toISOString()
      });
    })

    //copy paste
    $(document).bind({
      copy : function(event){
       eventBus.emit('copy', {
        clienttimestamp: new Date().toISOString()});
      },
      paste : function(e){
       eventBus.emit('paste', {
        textPlainData: e.originalEvent.clipboardData.getData("text/plain"),
        clienttimestamp: new Date().toISOString()
       });
      },
      cut : function(){
       eventBus.emit('cut', {
        clienttimestamp: new Date().toISOString()});
      }
    });

    // mouse events, for the time being they are judt
    // tracked to prevent an idle event from being emitted
    // TODO(triglian): If we want to send them to the server
    // we need to filter unusable information (like DOM elements)
    // and add `clienttimestamp`
    document.addEventListener("click", function(evt) {
      eventBus.emit("click", evt);
    });

    document.addEventListener("mousemove", function(evt) {
      eventBus.emit("mousemove", evt);
    });

    document.addEventListener("dblclick", function(evt) {
      eventBus.emit("dblclick", evt);
    });

    document.addEventListener("contextmenu", function(evt) {
      eventBus.emit("contextmenu", evt);
    });

    document.addEventListener("wheel", function(evt) {
      eventBus.emit("wheel", evt);
    });

    document.addEventListener("touchend", function(evt) {
      eventBus.emit("touchend", evt);
    });

    document.addEventListener("touchmove", function(evt) {
      eventBus.emit("touchmove", evt);
    });

    document.addEventListener("touchstart", function(evt) {
      eventBus.emit("touchstart", evt);
    });

    document.addEventListener("impress:stepenter", function(evt){ 
      eventBus.emit("slideenter", {
        slide: evt.target.id,
        clienttimestamp: new Date().toISOString() 
      })
    });

    document.addEventListener("impress:stepleave", function(evt){ 
      eventBus.emit("slideleave", {
        slide: evt.target.id,
        clienttimestamp: new Date().toISOString() 
      })
    });
  })
}
