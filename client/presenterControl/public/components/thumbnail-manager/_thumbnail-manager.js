'use strict';

var debug = require('bows')('thumbnail-manager')
var thumbGenerator = require('./impressThumbGenerator');

/** copied from impress.js (Copyright 2011-2012 Bartek Szopka (@bartaz))
* @function triggerEvent
* @description builds a custom DOM event with given `eventName` and `detail` data
* and triggers it on element given as `el`.
*/
var triggerEvent = function (el, eventName, detail) {
  var event = document.createEvent('CustomEvent');
  event.initCustomEvent(eventName, true, true, detail);
  el.dispatchEvent(event);
};

Polymer( {

  is: 'thumbnail-manager',

  properties: {
    target:{
      type: Object,
      value: function(){ return {};},
      notify: true
    },

    thumbs:{
      type: Array,
      value: function(){return [];},
      notify: true
    },

    eventBus:{
      type: Object,
      value: function(){ return {};},
      notify: true
    }
  },

  ready: function(){
    this.impressEl = null;
    this.thumbs = [];
    // sels for thumbs and containers
    this.sels = {
      thumbsBarId: '#thumbs-bar',
      thumbsHolderId    : '#thumb-holder',
      thumbListClass    : 'thumb-li',
      thumbContainerClass  : 'thumb',
      slideThumbClass : 'thumb-step',
      dragBarId: '#thumbs-bar #dragbar',
    };

    this.thumbGenerator = thumbGenerator({
      impressEl: this.impressEl,
      sels: this.sels
    });
  },

  // external function that will redraw all the slides
  redrawSlideShow : function(){},


  /** @function validateProps
  *   @description: validates properties
  */
  validateProps: function (){
    // we should have a root element to search for steps
    if(! this.impressEl){
      this.impressEl = document;
    }
  },

  /** @function init
  *   @description: adds resize listeners to the thumb container,
  *   and creates the thumbs for existing slides
  */
  init : function(){
    this.validateProps();
    var sels = this.sels;

    if(this.$.config.values.shouldGenerateThumbnails ){
      var ffRules = this.getFontFaceRules(this.impressEl);
      var regx = new RegExp(this.$.config.values.rootUrl, 'ig');

      var ffStrings = ffRules.map(function(rule){
        return rule.cssText.replace(regx, '');
      }.bind(this));

      this.persistFontFaces(ffStrings);

      this.generateThumbs();
      this.persistThumbs();

      this.injectFontFaceStrings(ffStrings);
      this.resizeThumbs();
      this.showThumbs();
    }else{ 
      //thumbs are already generated and up to date
      this.requestThumbs();
      this.requestFontFaces();
    }
    
  },

  generateThumbs : function(thumb, index){
    //add thumbs choose all elements 
    var steps = this.impressEl.querySelectorAll('.step');
    [].forEach.call(steps, function pushStep(step, idx){
      var thumb = this.thumbGenerator.createThumb(step);
      this.thumbs.push(thumb)
      this.injectThumb(thumb, idx) 
    }.bind(this));
  },

  persistThumbs : function(){
    this.eventBus.emit('socket-request', {
      name: '/user/presentation/thumbnails',
      detail: {
        method:"POST",
        presentationId: this.$.config.values.presentationId,
        thumbnails: this.thumbs.map(function(thumb){ return thumb.outerHTML;})
      }
    });
  },

  persistFontFaces : function(fontFaces){
    this.eventBus.emit('socket-request', {
      name: '/user/presentation/fontfaces',
      detail: {
        method:"POST",
        presentationId: this.$.config.values.presentationId,
        fontFaces: fontFaces
      }
    });
  },

  requestThumbs : function(){
    this.eventBus.on('/user/presentation/thumbnails', function(evt){
      var thumbnails = evt.thumbnails;

      var div = document.createElement('div');
      try{
        thumbnails.forEach(function(thumbHtml, idx){
          div.innerHTML = thumbHtml;
          var thumb = div.firstChild
          this.thumbs.push(thumb);
          this.injectThumb(thumb, idx) ;
        }.bind(this));
        this.generateThumbs();
        this.resizeThumbs();
        this.showThumbs();
      }catch(err){
        debug(err, err.stack);
      }
    }.bind(this))

    this.eventBus.emit('socket-request', {
      name: '/user/presentation/thumbnails',
      detail: {
        method:"GET",
        presentationId: this.$.config.values.presentationId
      }
    });
  },

  requestFontFaces : function(){
    this.eventBus.on('/user/presentation/fontfaces', function(evt){
      var fontFaces = evt.fontFaces || []
      this.persistFontFaces(fontFaces);
    }.bind(this));

    this.eventBus.emit('socket-request', {
      name: '/user/presentation/fontfaces',
      detail: {
        method:"GET",
        presentationId: this.$.config.values.presentationId
      }
    });
  },



  /** @function injectThumb
  *   @description: injects a cloned slide to the thumb bar after it wraps it with
  * a container element and a label. index 
  * is a parameter that jQuery each() functions pass. It's not
  * used currently
  */
  injectThumb : function(thumb, index){
    var sels = this.sels
    , ref = thumb.dataset.references
    , impressBody= this.impressEl.body;

    // look if the body has an impress-on-* class and cache it
    var saved_body_class
      , body_classes = impressBody.classList;

    for (var i = 0; i < body_classes.length; i++) {
      var c = body_classes[i];
      if (c.match('^impress-on-')) {
        saved_body_class = c;
      }
    }

    if (saved_body_class) {
      impressBody.classList.remove(saved_body_class);
    }

    //force the body to be on the current ref slide 
    // (we're going to use the body background for the 
    // thumb background)
    impressBody.classList.remove('impress-on-'+ref);

    var pct = document.createElement("presenter-control-thumbnail");
    pct.index = index+1;
    pct.ref = thumb.dataset.references;
    pct.$$('#thumb').appendChild(thumb);
    pct.style.background = impressBody.style.background;
    pct.setAttribute('none', "none");
    Polymer.dom(this.target).appendChild(pct);

    //clean up body impress-on- class and restore previous one
    impressBody.classList.remove('impress-on-'+ref);

    if (saved_body_class) {
      impressBody.classList.add(saved_body_class);
    }
  },

  showThumbs : function(){
  
    var animations = Polymer.dom(this.target).querySelectorAll("presenter-control-thumbnail")
    .map(function(pct, index){
      return new KeyframeEffect(pct, [
        {"opacity" : 0}, {"opacity" : 0.7}
        ], {
          duration: 200,
          delay: 120 * index,
          easing: 'ease-out', 
          iterations:1,
          fill:"backwards"
      });
    });
    var seq = new GroupEffect(animations);
    document.timeline.play(seq);
  },


  /** @function selectThumb
  *   @description: Highlight the thumb that corresponds to the
  * specified thumb id
  */
  selectThumb : function(stepId){
    if(stepId instanceof Array){

    }else if(typeof stepId == 'string'){

    }

    var selectedThumb = this.target.querySelector('.' + this.sels.thumbContainerClass+'[data-references='+ stepId+']');
    [].forEach.call(selectedThumb.parentNode.childNodes, function removeActiveClass(el){
      el.classList.remove('active');
    });
    selectedThumb.classList.add('active');
  },
 
  /** @function insertThumb
  *   @description: given a step id it creates the corresponding
  * thumb and adds it to the thumbar
  */
  insertThumb : function(stepId){
    var newThumb = this.thumbGenerator.createThumb(impressEl.querySelectorAll('#' + stepId));
    // this.$thumbs = this.$thumbs.add($newThumb);

    this.injectThumb(0, newThumb)
    that.resizeThumbs();
  },

  /** @function resizeThumbs
  *   @description: resizes all thumbs to fit their container width
  */
  resizeThumbs : function(){
    this.thumbs.forEach( function resizeThumb(thumb){
      this.thumbGenerator.resizeThumb(thumb, {width: 200, height: 150});
    }.bind(this));
  },

  /** @function getFontFaceRules
  *   @description: resizes all CSSFontFaceRule rules in a doc
  *   @param: {HTMLDocument} doc the document to get the FontFaceRules from
  */
  getFontFaceRules: function(doc){
    var ffRules = [];
    var sheets = doc.styleSheets;
      for(var i = 0; i < sheets.length; i++) {
        var rules = sheets[i].rules || sheets[i].cssRules;
        if(! rules) continue;
        for(var r = 0; r < rules.length; r++) {
          if(rules[r].type == 5 ){ // CSSFontFaceRule
            ffRules.push(rules[r]);
         }
        }
      }
      return ffRules;
  },

  /** @function injectFontFaceStrings
  *   @description: injects passed string to the document head inside a style element
  *   @param: [string] fontFaceStrings the font face rule strings to inject
  */
  injectFontFaceStrings: function(fontFaceStrings){
    var style = document.createElement("style");
    fontFaceStrings.forEach(function(ff){
      style.appendChild(document.createTextNode(ff));
    });

    document.head.appendChild(style);
  }
});
