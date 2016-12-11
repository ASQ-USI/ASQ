exports.command = function dragAndDropFile(file2Upload, callback) {
  var browser = this;

  browser
    .execute(function() {
     var input = document.createElement('input');
     input.id = 'nightwatch-text-file-input';
     input.type = 'file';
     input.name = 'nightwatch-text-file-input';
     input.style.visibility = 'hidden';
     document.body.appendChild(input);
     return true;
    }, [])
    .setValue('input#nightwatch-text-file-input', file2Upload)
    .pause(1000)
    .execute(function() {
     function fireCustomEvent(eventName, element, data) {
       'use strict';
       var event;
       data = data || {};
       if (document.createEvent) {
         event = document.createEvent("HTMLEvents");
         event.initEvent(eventName, true, true);
       } else {
         event = document.createEventObject();
         event.eventType = eventName;
       }

       event.eventName = eventName;
       event = $.extend(event, data);

       if (document.createEvent) {
         element.dispatchEvent(event);
       } else {
         element.fireEvent("on" + event.eventType, event);
       }
     }

     var input = document.getElementById("nightwatch-text-file-input");
     var fileList = [];

     fileList.push(input.files[0]);

     var dropzone = document.getElementById("le-dropzone");

     fireCustomEvent("drop", dropzone, {dataTransfer: {files: fileList}});

     return true;
    }, [])

  return this;
};
