module.exports = {
  url: function() {
    return `${this.api.launchUrl}/upload`;
  },
  elements: {
    uploadForm: {
      selector: 'form#le-dropzone'
    },
    uploadMessage: {
      selector: '.dz-message'
    },
    uploadDetails: {
      selector: '#upload-details'
    },
    uploadBtn: {
      selector: 'button#upload-btn'
    },
    presentationTitleInput: {
      selector: 'input[name=title]'
    },
    nightwatchTextFileInput: {
      selector: 'input#nightwatch-text-file-input'
    },
    removeFileBtn: {
      selector: 'a.data-dz-remove'
    }
  },
  commands: [{
    dragAndDropFile: function(file2Upload, callback) {

      this.api
        .execute(function() {
         var input = document.createElement('input');
         input.id = 'nightwatch-text-file-input';
         input.type = 'file';
         input.name = 'nightwatch-text-file-input';
         input.style.visibility = 'hidden';
         document.body.appendChild(input);
         return true;
        }, []);

      this.setValue('@nightwatchTextFileInput', file2Upload);

      this.api.pause(1000)
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

      return this.api;
    },
    presentationUpload: function(file) {
      this
          .waitForElementVisible('@uploadForm', 1000)
          .dragAndDropFile(file)

      this.click('@uploadBtn');
      this.api.pause(3000);

      return this.api;
    }
  }]
};