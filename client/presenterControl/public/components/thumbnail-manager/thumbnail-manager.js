/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var debug = __webpack_require__(1)('thumbnail-manager')
	var thumbGenerator = __webpack_require__(3);
	
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  function checkColorSupport() {
	    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
	      return false;
	    }
	    var chrome = !!window.chrome,
	        firefox = /firefox/i.test(navigator.userAgent),
	        firefoxVersion;
	
	    if (firefox) {
	        var match = navigator.userAgent.match(/Firefox\/(\d+\.\d+)/);
	        if (match && match[1] && Number(match[1])) {
	            firefoxVersion = Number(match[1]);
	        }
	    }
	    return chrome || firefoxVersion >= 31.0;
	  }
	
	  var yieldColor = function() {
	    var goldenRatio = 0.618033988749895;
	    hue += goldenRatio;
	    hue = hue % 1;
	    return hue * 360;
	  };
	
	  var inNode = typeof window === 'undefined',
	      ls = !inNode && window.localStorage,
	      debugKey = ls.andlogKey || 'debug',
	      debug = ls[debugKey],
	      logger = __webpack_require__(2),
	      bind = Function.prototype.bind,
	      hue = 0,
	      padLength = 15,
	      noop = function() {},
	      colorsSupported = ls.debugColors || checkColorSupport(),
	      bows = null,
	      debugRegex = null,
	      invertRegex = false,
	      moduleColorsMap = {};
	
	  if (debug && debug[0] === '!' && debug[1] === '/') {
	    invertRegex = true;
	    debug = debug.slice(1);
	  }
	  debugRegex = debug && debug[0]==='/' && new RegExp(debug.substring(1,debug.length-1));
	
	  var logLevels = ['log', 'debug', 'warn', 'error', 'info'];
	
	  //Noop should noop
	  for (var i = 0, ii = logLevels.length; i < ii; i++) {
	      noop[ logLevels[i] ] = noop;
	  }
	
	  bows = function(str) {
	    var msg, colorString, logfn;
	    msg = (str.slice(0, padLength));
	    msg += Array(padLength + 3 - msg.length).join(' ') + '|';
	
	    if (debugRegex) {
	        var matches = str.match(debugRegex);
	        if (
	            (!invertRegex && !matches) ||
	            (invertRegex && matches)
	        ) return noop;
	    }
	
	    if (!bind) return noop;
	
	    var logArgs = [logger];
	    if (colorsSupported) {
	      if(!moduleColorsMap[str]){
	        moduleColorsMap[str]= yieldColor();
	      }
	      var color = moduleColorsMap[str];
	      msg = "%c" + msg;
	      colorString = "color: hsl(" + (color) + ",99%,40%); font-weight: bold";
	
	      logArgs.push(msg, colorString);
	    }else{
	      logArgs.push(msg);
	    }
	
	    if(arguments.length>1){
	        var args = Array.prototype.slice.call(arguments, 1);
	        logArgs = logArgs.concat(args);
	    }
	
	    logfn = bind.apply(logger.log, logArgs);
	
	    logLevels.forEach(function (f) {
	      logfn[f] = bind.apply(logger[f] || logfn, logArgs);
	    });
	    return logfn;
	  };
	
	  bows.config = function(config) {
	    if (config.padLength) {
	      padLength = config.padLength;
	    }
	  };
	
	  if (true) {
	    module.exports = bows;
	  } else {
	    window.bows = bows;
	  }
	}).call();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// follow @HenrikJoreteg and @andyet if you like this ;)
	(function () {
	    var inNode = typeof window === 'undefined',
	        ls = !inNode && window.localStorage,
	        out = {};
	
	    if (inNode) {
	        module.exports = console;
	        return;
	    }
	
	    var andlogKey = ls.andlogKey || 'debug'
	    if (ls && ls[andlogKey] && window.console) {
	        out = window.console;
	    } else {
	        var methods = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),
	            l = methods.length,
	            fn = function () {};
	
	        while (l--) {
	            out[methods[l]] = fn;
	        }
	    }
	    if (true) {
	        module.exports = out;
	    } else {
	        window.console = out;
	    }
	})();


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var debug = __webpack_require__(1)("impressThumbGenerator")
	module.exports = function(opts){
	  var impressEl = null
	    , options = opts
	    , thumbs = [];
	
	
	  var resizeConf = {
	    width: "360",
	    height: "240"
	  }
	
	  // sels for thumbs and containers
	  sels = {
	    thumbContainerClass  : "thumb",
	    slideThumbClass : "thumb-step"
	  };
	
	  /** @function _validateAndSetOptions
	  *   @description: validates external options and, if valid, overrides defaults
	  */
	  function _validateAndSetOptions(options){
	    if(!options){return;}
	
	    if(options.impressEl){
	      impressEl = options.impressEl
	    }else{
	      impressEl = document;
	    }
	
	    if(options.resize){
	      if("undefined" === typeof options.resize.width && "undefined" === typeof options.resize.width){
	        debug("options.resize object needs at least one of the following properties: width, height");
	      }else if("undefined" !== typeof options.resize.width && isNaN(parseInt(options.resize.width))){
	        debug("options.resize.width should be a number");
	      }else if("undefined" !== typeof options.resize.height && isNaN(parseInt(options.resize.height))){
	        debug("options.resize.height should be a number");
	      }else{
	        resizeConf = options.resize
	      }
	    }
	
	    if(options.sels){
	      for (var key in sels){
	        if( options.sels[key]){
	          if(!(typeof options.sels[key] == "string")){
	            console.log("_validateAndSetOptions(): options.sels." + key + " should be a string")
	            return;
	          }else{
	            sels[key] = options.sels[key];
	          }
	        } 
	      }
	    }
	  }
	
	  /** @function createThumb
	  *   @description: creates a clone of the original element,
	  *   appends '-clone' to the original id and removes any
	  *   classes for the cloned element and its children.
	  *   iIt also adds a data-references attribute to the referenced
	  *   step and sets the transform-origin css property.
	  */
	  function createThumb(slide){
	
	    var slide_classes = slide.classList;
	    var saved_slide_classes = [];
	
	    for (var i = 0; i< slide_classes.length; i++) {
	      var c = slide_classes[i];
	      if (c.match("(^future|^past|^present|^active)")) {
	        saved_slide_classes.push(c);
	      }
	    }
	
	    //remove classes
	    saved_slide_classes.forEach(function removeClasses(saved_slide_class){
	      slide.classList.remove(saved_slide_class)
	    });
	    // make every slide look like its the current one
	    slide.classList.add("active");
	    slide.classList.add("present");
	
	    var clone = slide.cloneNode(true)
	    , cloneId = clone.id
	
	    , styles = {
	        "-webkit-touch-callout" : "",
	        "-webkit-user-select" : "",
	        "-khtml-user-select" : "",
	        "-moz-user-select" : "",
	        "-ms-user-select" : "",
	        "user-select" : "",
	        "pointer-events" : "none",
	        "opacity": "1"
	    };
	
	    //change id only if not empty
	    clone.id = (cloneId === undefined || cloneId == '') 
	      ? '' 
	      : cloneId + "-clone";
	    clone.classList.add(sels.slideThumbClass);
	
	    //copy original computed style
	    setStylesFromObject(clone, _css(slide));
	    setStylesFromObject(clone, styles);
	
	    //add reference to original slide
	    clone.dataset.references = slide.id;
	    
	    //set transform orign property
	    clone.style["-webkit-transform-origin"] = "0 0";
	
	    var cloneChildren = [].slice.call(clone.querySelectorAll('*'));
	    //copy original computed style for children
	    [].forEach.call(slide.querySelectorAll('*'), function copyComputedStyleForChildren(el , index){
	
	      var child = cloneChildren[index];
	      var id = child.id;
	      child.removeAttribute('id');
	      child.removeAttribute('class');
	
	       //copy original computed style
	      setStylesFromObject(child, _css(el));
	      setStylesFromObject(child, styles)
	
	    });
	
	    //revert style to original slide
	    saved_slide_classes.forEach(function revertStyles(saved_slide_class){
	
	    });   
	
	    return clone;
	  }
	
	  /** @function resizeThumb
	  *   @description: resizes a thumbs to fit specified width and height (in pixels) or both
	  */
	  function resizeThumb(thumb, options){
	    //copy resizeConf
	    var strategy = JSON.parse(JSON.stringify(resizeConf))
	    if("undefined" !== typeof options){
	      if("undefined" === typeof options.width && "undefined" === typeof options.height){
	        debug("options object needs at least one of the following properties: width, height")
	      }else if("undefined" !== typeof options.width && isNaN(parseInt(options.width))){
	        debug("options.width should be a number")
	      }else if("undefined" !== typeof options.height && isNaN(parseInt(options.height))){
	        debug("options.height should be a number")
	      }else{
	        strategy = options
	      }
	    }
	 
	    var scaleFactor= 1.0
	      , fixedWrapper = false;
	
	    //need to fit to the exact size
	    if("undefined" !== typeof strategy.width 
	      && "undefined" !== typeof strategy.height)
	    {
	      fixedWrapper = true;
	      var thumbContentWidth = parseInt(strategy.width)
	        , thumbContentHeight = parseInt(strategy.height)
	        , contentRatio = thumbContentWidth / thumbContentHeight
	        , thumbRatio = thumb.offsetWidth / thumb.offsetHeight;
	
	      //thumb wrapper has defined dimensions from the strategy
	      setStylesFromObject(thumb.parentNode, {
	        "width"  : thumbContentWidth + "px",
	        "height" : thumbContentHeight + "px" 
	      });
	
	      // fit on height
	      if (contentRatio > thumbRatio){
	        delete strategy.width
	      }// fit on width
	      else{
	        delete strategy.height
	      }
	    }
	
	    //resize based on width
	    if("undefined" !== typeof strategy.width 
	      && "undefined" === typeof strategy.height)
	    {
	      var thumbContentWidth = parseInt(strategy.width);
	      scaleFactor =  thumbContentWidth / thumb.offsetWidth;
	    }//resize based on height
	    else {
	      var thumbContentHeight = parseInt(strategy.height);
	      scaleFactor =  thumbContentHeight / thumb.offsetHeight;
	    }
	
	    thumb.style["-webkit-transform"] = "scale("+scaleFactor+")";
	    thumb.style["transform"] = "scale("+scaleFactor+")";
	    
	
	    if(fixedWrapper){
	      setStylesFromObject(thumb.parentNode, {
	        "position" : "relative",
	        "overflow" : "hidden"
	      })
	
	      var top = (thumb.parentNode.clientHeight - (thumb.offsetHeight* scaleFactor))/ 2 + "px";
	      var left = (thumb.parentNode.clientWidth - (thumb.offsetWidth* scaleFactor ))/ 2 + "px";
	
	      setStylesFromObject(thumb, {
	        "position" : "absolute",
	        "top" : top,
	        "left" : left
	      })
	    }else{ //adjust thumb wrapper to match thumb
	      setStylesFromObject(thumb.parentNode, {
	        "width"  : parseInt(thumb.offsetWidth * scaleFactor) + "px",
	        "height" : parseInt(thumb.offsetHeight * scaleFactor) + "px" 
	      });
	      setStylesFromObject(thumb, {
	        "position" : "relative",
	        "top" : "0px",
	        "left" : "0px"
	      })
	    }
	
	
	
	  }
	
	  /** @function setStylesFromObject
	  *   @description: Sets style properties in an element as defined in an object
	  *   with key-value pairs of rules (compatible with jQuery)
	  */
	  function setStylesFromObject(el, cssObj){
	    Object.keys(cssObj).forEach(function setStyleFromObject(key){
	      el.style[key] = cssObj[key];
	    });
	  }
	
	  /** @function _css
	  *   @description: Gets the computed styles of an element and returns
	  *   key-value pairs of rules (compatible with jQuery)
	  */
	  function _css(el){
	      var rules = window.getComputedStyle(el);
	      return _css2json(rules);
	  }
	
	  /** @function _css2json
	  *   @description: Converts CSSStyleDeclaration objects or css rules
	  *   in string format to key-value pairs (compatible with jQuery)
	  */
	  function _css2json(css){
	      var s = {};
	      if(!css) return s;
	      if(css instanceof CSSStyleDeclaration) {
	          for(var i in css) {
	            if(!css[i]) {break;}
	              if((css[i]).toLowerCase) {
	                  s[(css[i]).toLowerCase()] = (css[css[i]]);
	              }
	          }
	      } 
	      else if(typeof css == "string") {
	          css = css.split("; ");          
	          for (var i in css) {
	              var l = css[i].split(": ");
	              s[l[0].toLowerCase()] = (l[1]);
	          };
	      }
	      return s;
	  }
	
	  // Public API
	  return {
	    createThumb : createThumb,
	    resizeThumb : resizeThumb
	  }
	}


/***/ }
/******/ ]);
//# sourceMappingURL=thumbnail-manager.js.map