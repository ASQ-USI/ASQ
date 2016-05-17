/** @module client/js/views/upload
    @description front-end logic for upload.dust
*/
'use strict';
var debug = require('bows')("js/views/upload");
var menuDOMBinder = require('./menu');
var Dropzone = require('Dropzone');
// 
module.exports = {
  activateDropzone: function(){
      Dropzone.options.leDropzone = {
      paramName: "upload",
      uploadMultiple: false,
      maxFiles: 1,
      parallelUploads: 1, 
      autoProcessQueue: false,
      clickable: ".dz-message",
      acceptedFiles:  "application/zip",
      previewsContainer: "#previews",
      init: function() {

        var fadeOutTimeout;

        this.on("dragover", function(){
          clearTimeout(fadeOutTimeout)
          $('#dropzone-dragover-overlay').fadeIn();
          fadeOutTimeout = setTimeout(function(){
             $('#dropzone-dragover-overlay').fadeOut()
          }, 300)
        });

        this.on("drop", function(event){
          clearTimeout(fadeOutTimeout)
          $('#dropzone-dragover-overlay').fadeOut(10);
        });

        this.on("maxfilesexceeded", function(file) { 
          this.removeFile(file); 
        });

        this.on("addedfile", function(file){

          // Create the remove button
          var btnHTML = '<a href="#remove" class="remove data-dz-remove" data-toggle="tooltip" data-placement="left" title="Remove zip file" data-original-title="Remove zip file">×</a>';
          var removeButton = Dropzone.createElement(btnHTML);

          removeButton.addEventListener("click", function(e) {
          // Make sure the button click doesn't submit the form:
            e.preventDefault();
            e.stopPropagation();

            this.removeFile(file);
          }.bind(this));

          file.previewElement.appendChild(removeButton);

          //set default title
          var pTitle = document.getElementById("title-input");

          if(pTitle.value.trim() === ""){
            pTitle.value = file.name.replace(/\.zip$/, "");
          }

          //hide drop message and show the rest of the form
          $('.dz-message').fadeOut(0);
          $('#upload-details').show();
          $('.dropzone-previews').show(0);
          $('#upload-btn').show(0)
        });

        this.on("removedfile", function(file){
          if(this.files.length ===0){
            $('.dz-message').fadeIn(0);
            $('#upload-details').hide();
            $('.dropzone-previews').hide(0);
            $('#upload-btn').hide(0)
          }

          var pTitle = document.getElementById("title-input");
          pTitle.value = "";          
        });

        this.on("sending", function(file, xhr, formData){
         formData.append("fullPath", file.fullPath)
        });

        this.on("sendingmultiple", function(){
          console.log(arguments);
        })

        this.on("success", function(){
          setTimeout(function(){
            window.location = this.element.action;
          }.bind(this), 300);
        })

        $('#upload-btn').click(function(e){
          e.preventDefault();
          e.stopPropagation();
          this.processQueue();
        }.bind(this))
      }
    };
  },
  init: function(){
    //init main menu
    menuDOMBinder();

    this.activateDropzone()

    //disable no-touch classes
    if ('ontouchstart' in document) {
      $('body').removeClass('no-touch');
    }
  }
} 

