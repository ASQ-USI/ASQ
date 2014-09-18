'use strict';
var debug = require('bows')("Thumbmanager")
var thumbGenerator =  require('./presentationAdapter/asq-impress-adapter/thumbGenerator')
var ThumbManager = module.exports = function (options, $){
  this.impressEl = null;;
  this.options = options;
  this.$thumbs = $([]);
  this.thumbGenerator = thumbGenerator(this.options, $)

  // external function that will redraw all the slides
  this.redrawSlideShow = function(){};

  // sels for thumbs and containers
  this.sels = {
    thumbsBarId: "#thumbs-bar",
    thumbsHolderId    : "#thumb-holder",
    thumbListClass    : "thumb-li",
    thumbContainerClass  : "thumb",
    slideThumbClass : "thumb-step",
    dragBarId: "#thumbs-bar #dragbar",
  };

  /** @function validateAndSetOptions
  *   @description: validates external options and, if valid, overrides defaults
  */
  ThumbManager.prototype.validateAndSetOptions = function (options){
    if(!options){return;}

    if(options.impressEl){
      this.impressEl = options.impressEl
    }else{
      this.impressEl = document;
    }

    if(options.sels){
      for (var key in this.sels){
        if( options.sels[key]){
          if(!(typeof options.sels[key] == "string")){
            console.log("Error atThumbManager.validateAndSetOptions(): options.sels." + key + " should be a string")
            return;
          }else{
            this.sels[key] = options.sels[key];
          }
        } 
      }
    }
  }

  /** @function init
  *   @description: adds resize listeners to the thumb container,
  *   and creates the thumbs for existing slides
  */
  ThumbManager.prototype.init = function(){
    this.validateAndSetOptions(this.options)
    var that = this
    , sels = this.sels;

    $(sels.thumbsHolderId).on('click', '.' + sels.thumbContainerClass, function(){
      triggerEvent(document, 'thumbnailClicked', event.target)
      console.log('clicked');
    })
  
    //add thumbs choose all elements 
    var $steps = $(this.impressEl).find('.step');
    var thumbs = [];
    $steps.each(function(index){
     thumbs.push(that.thumbGenerator.createThumb($(this)))
    })

    //add to thumbsbar
    $.each(thumbs, that.injectThumb.bind(that));

    //cache jquery objects
    that.$thumbs = $("."+ this.sels.slideThumbClass);
    that.resizeThumbs();
  }

  /** @function injectThumb
  *   @description: injects a cloned slide to the thumb bar after it wraps it with
  * a container element and a label. index 
  * is a parameter that jQuery each() functions pass. It's not
  * used currently
  */
  ThumbManager.prototype.injectThumb = function(index, thumb){
    var sels = this.sels
    , $thumb = $(thumb)
    , ref = $thumb.attr('data-references')
    , $impressBody= $(this.impressEl).find('body').eq(0);

    // look if the body has an impress-on-* class and cache it
    var saved_body_class
      , body_classes = $impressBody[0].classList;

    for (var i = 0; i<body_classes.length; i++) {
      var c = body_classes[i];
      if (c.match("^impress-on-")) {
        saved_body_class = c;
      }
    }

    if (saved_body_class) {
        $impressBody.removeClass(saved_body_class);
    }

    //force the body to be on the current ref slide 
    // (we're going to use the body background for the 
    // thumb background)
    $impressBody.addClass("impress-on-"+ref);

    $(sels.thumbsBarId + ' ' + sels.thumbsHolderId).append($thumb)
    $thumb
      .wrap('<li id="' + ref + '-thumb" class="'+ sels.thumbListClass +'" data-references="' + ref + '"></li>')
      .wrap('<div class="'+ sels.thumbContainerClass +'"></div>')
      .parent()
        .css("background", $impressBody.css('background'))
        // add the delete button to each thumb
        // .prepend('<a class="close" href="#">&times;</a>')
        .parent()
          .append('<div class="thumb-id-label">'+ ref + '</div>');

    //clean up body impress-on- class and restore previous one
    $impressBody.removeClass("impress-on-"+ref);

    if (saved_body_class) {
        $impressBody.addClass(saved_body_class);
    }
  }


  /** @function selectThumb
  *   @description: Highlight the thumb that corresponds to the
  * specified thumb id
  */
  ThumbManager.prototype.selectThumb = function(stepId){
    if(stepId instanceof Array){

    }else if(typeof stepId == "string"){

    }
    $('.' + this.sels.thumbContainerClass+'[data-references='+ stepId+']')
      .addClass('active')
    .siblings()
      .removeClass('active')
      //.parent().removeClass("ui-selected")
    //$('.' + this.sels.slideThumbClass+'[data-references='+ stepId+']').parent().addClass('active');
  }
 
  /** @function insertThumb
  *   @description: given a step id it creates the corresponding
  * thumb and adds it to the thumbar
  */
  ThumbManager.prototype.insertThumb = function(stepId){
    var $newThumb = this.thumbGenerator.createThumb($('#' + stepId));
    // this.$thumbs = this.$thumbs.add($newThumb);

    this.injectThumb(0, $newThumb[0])
    that.resizeThumbs();
  }

  /** @function resizeThumbs
  *   @description: resizes all thumbs to fit their container width
  */
  ThumbManager.prototype.resizeThumbs = function(){
    this.$thumbs.each( function(index, thumb){
      this.thumbGenerator.resizeThumb($(thumb), {width: 400, height: 220});
    }.bind(this));
  }


  /** copied from impress.js (Copyright 2011-2012 Bartek Szopka (@bartaz))
  * @function triggerEvent
  * @description builds a custom DOM event with given `eventName` and `detail` data
  * and triggers it on element given as `el`.
  */
  var triggerEvent = function (el, eventName, detail) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent(eventName, true, true, detail);
    el.dispatchEvent(event);
  };
}