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
        eventBus.emit('exercisefocus', {exerciseUid: $(el).attr('uid') });
      }).on('blur', function(e){
        eventBus.emit('exerciseblur', {exerciseUid: $(el).attr('uid') });
      })
    });

    document.addEventListener("focusin", function(evt) {
      var uid = evt.target.getAttribute('uid') || '';
      var tagname = event.target.tagName.toLowerCase();
      var eventName = "tab" + document.visibilityState;
      eventBus.emit("focusin", {
        uid: uid,
        tagname: tagname
      });
    });

    document.addEventListener("focusout", function(evt) {
      var uid = evt.target.getAttribute('uid') || '';
      var tagname = event.target.tagName.toLowerCase();
      var eventName = "tab" + document.visibilityState;
      eventBus.emit("focusout", {
        uid: uid,
        tagname: tagname
      });
    });

    document.addEventListener("input", function(evt) {
      var uid = evt.target.getAttribute('uid') || '';
      var tagname = event.target.tagName.toLowerCase();
      var eventName = "tab" + document.visibilityState;
      eventBus.emit("input", {
        uid: uid,
        tagname: tagname,
        value: evt.target.value
      });
    });

    document.addEventListener("visibilitychange", function() {
      var eventName = "tab" + document.visibilityState;
      eventBus.emit(eventName, {});
    });

    window.addEventListener('focus', function(){
      eventBus.emit('windowfocus', {});
    })

    window.addEventListener('blur', function(){
      eventBus.emit('windowblur', {});
    })

    //copy paste
    $(document).bind({
      copy : function(event){
       eventBus.emit('copy', {});
      },
      paste : function(e){
       eventBus.emit('paste', {
        textPlainData: e.originalEvent.clipboardData.getData("text/plain")
       });
      },
      cut : function(){
       eventBus.emit('cut', {});
      }
    });
  })
}
